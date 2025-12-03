export function getOrderLineCountsForOrder(order, orderLineState = {}, orderLineCache = {}) {
    if (!order) return { remainingLines: 0, totalLines: 0 };

    const stateEntry = orderLineState[order.id];
    const stateTotal = Number.isFinite(stateEntry?.totalLines) ? stateEntry.totalLines : null;
    const stateRemaining = Number.isFinite(stateEntry?.remainingLines)
        ? Math.max(Math.min(stateEntry.remainingLines, stateTotal ?? stateEntry.remainingLines), 0)
        : null;

    if (stateTotal !== null) {
        return {
            totalLines: stateTotal,
            remainingLines: stateRemaining ?? stateTotal,
        };
    }

    const cachedEntry = orderLineCache[order.id];
    const cachedLength = Array.isArray(cachedEntry)
        ? cachedEntry.length
        : (Number.isFinite(cachedEntry?.length) ? cachedEntry.length : 0);

    const cachedTotal = Number.isFinite(cachedEntry?.totalLines)
        ? cachedEntry.totalLines
        : (Number.isFinite(cachedEntry?.totalItems) ? cachedEntry.totalItems : null);

    const totalLines = [order.totalItems, cachedTotal, cachedLength, order.items]
        .find((value) => Number.isFinite(value) && value >= 0) ?? 0;

    const remainingCandidate = order.status === 'pending'
        ? (order.totalItems ?? cachedTotal ?? order.items ?? cachedLength)
        : (order.items ?? cachedLength ?? order.totalItems ?? cachedTotal);

    const remainingLines = Math.max(Math.min(remainingCandidate ?? 0, totalLines), 0);

    return { remainingLines, totalLines };
}
