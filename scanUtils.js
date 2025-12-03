export function normalizeScanCode(rawCode) {
    const cleaned = String(rawCode ?? '')
        .trim()
        .replace(/\s+/g, '')
        .toUpperCase();

    if (!cleaned) return '';

    return cleaned.replace(/(^|[^0-9])(0+)(\d+)/g, (match, prefix, zeros, digits) => {
        const numericPart = Number(`${zeros}${digits}`);
        return `${prefix}${numericPart}`;
    });
}

export function findMatchingItems(rawCode, items = []) {
    const normalizedCode = normalizeScanCode(rawCode);

    if (!normalizedCode) {
        return { matchedItems: [], matchedBy: null, normalizedCode: '' };
    }

    const normalizedItems = items.map((item) => ({
        item,
        normalizedId: normalizeScanCode(item.id),
        normalizedLocation: normalizeScanCode(item.location),
    }));

    const matchesById = normalizedItems
        .filter((entry) => entry.normalizedId === normalizedCode)
        .map((entry) => entry.item);

    if (matchesById.length > 0) {
        return { matchedItems: matchesById, matchedBy: 'id', normalizedCode };
    }

    const matchesByLocation = normalizedItems
        .filter((entry) => entry.normalizedLocation === normalizedCode)
        .map((entry) => entry.item);

    return {
        matchedItems: matchesByLocation,
        matchedBy: matchesByLocation.length > 0 ? 'location' : null,
        normalizedCode,
    };
}
