const NON_ALPHANUMERIC = /[^A-Z0-9]/g;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

function compactNumericSegments(code) {
    return code.replace(/(\d+)/g, (digits) => String(Number(digits)));
}

export function normalizeScanCode(rawCode) {
    const cleaned = String(rawCode ?? '')
        .replace(CONTROL_CHARS, '')
        .trim()
        .toUpperCase();

    if (!cleaned) return '';

    // Houd letters/cijfers over zodat spaties, streepjes en barcode-separators
    // (zoals GS1/FNC separators) consistent gematcht kunnen worden.
    return cleaned.replace(NON_ALPHANUMERIC, '');
}

export function getScanCodeVariants(rawCode) {
    const normalized = normalizeScanCode(rawCode);
    if (!normalized) return [];

    const compacted = compactNumericSegments(normalized);
    if (compacted === normalized) {
        return [normalized];
    }

    return [normalized, compacted];
}

function matchByFields(rawCode, records = [], fieldResolvers = {}) {
    const variants = getScanCodeVariants(rawCode);
    const normalizedCode = variants[0] || '';

    if (!normalizedCode) {
        return { matchedItems: [], matchedBy: null, normalizedCode: '' };
    }

    for (const [matchKey, resolver] of Object.entries(fieldResolvers)) {
        const matches = records.filter((record) => {
            const rawValue = typeof resolver === 'function' ? resolver(record) : record?.[resolver];
            if (!rawValue) return false;

            const recordVariants = getScanCodeVariants(rawValue);
            return recordVariants.some((variant) => variants.includes(variant));
        });

        if (matches.length > 0) {
            return { matchedItems: matches, matchedBy: matchKey, normalizedCode };
        }
    }

    return { matchedItems: [], matchedBy: null, normalizedCode };
}

export function findMatchingItems(rawCode, items = []) {
    return matchByFields(rawCode, items, {
        id: (item) => item.id,
        location: (item) => item.location,
    });
}

export function findMatchingAssets(rawCode, assets = []) {
    return matchByFields(rawCode, assets, {
        serial: (asset) => asset.serial,
        deviceNumber: (asset) => asset.deviceNumber,
        location: (asset) => asset.location,
    });
}

export function findMatchingLocations(rawCode, locations = []) {
    const locationRecords = locations.map((location) => ({ location }));
    const result = matchByFields(rawCode, locationRecords, {
        location: (entry) => entry.location,
    });

    return {
        ...result,
        matchedItems: result.matchedItems.map((entry) => entry.location),
    };
}
