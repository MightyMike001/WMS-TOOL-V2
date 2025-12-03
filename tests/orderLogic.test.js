import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrderLineCountsForOrder } from '../orderLogic.js';

test('orders prefer per-order state values when present', () => {
    const order = { id: 'ORD-STATE', status: 'partial', totalItems: 99 };
    const orderLineState = { 'ORD-STATE': { totalLines: 7, remainingLines: 3 } };
    const cache = { 'ORD-STATE': [{}, {}, {}, {}] };

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order, orderLineState, cache);

    assert.equal(totalLines, 7);
    assert.equal(remainingLines, 3);
});

test('state totals clamp remaining lines to sensible bounds', () => {
    const order = { id: 'ORD-CLAMP', status: 'pending' };
    const orderLineState = { 'ORD-CLAMP': { totalLines: 5, remainingLines: 8 } };

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order, orderLineState);

    assert.equal(totalLines, 5);
    assert.equal(remainingLines, 5);
});

test('falls back to cached line length when state is missing', () => {
    const order = { id: 'ORD-CACHE', status: 'pending' };
    const cache = { 'ORD-CACHE': [{}, {}, {}] };

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order, {}, cache);

    assert.equal(totalLines, 3);
    assert.equal(remainingLines, 3);
});

test('uses order totals when no state or cache is available', () => {
    const order = { id: 'ORD-FALLBACK', status: 'pending', totalItems: 6 };

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order);

    assert.equal(totalLines, 6);
    assert.equal(remainingLines, 6);
});
