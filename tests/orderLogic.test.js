import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrderLineCountsForOrder } from '../orderLogic.js';

test('pending orders show full total regardless of cached subset', () => {
    const order = { id: 'ORD-1', status: 'pending', totalItems: 4, items: 4 };
    const cache = { 'ORD-1': [{}, {}, {}] }; // cache accidentally trimmed

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order, cache);

    assert.equal(totalLines, 4);
    assert.equal(remainingLines, 4);
});

test('partial orders keep original total while showing remaining lines', () => {
    const order = { id: 'ORD-2', status: 'partial', totalItems: 5, items: 2 };
    const cache = { 'ORD-2': [{}, {}] };

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order, cache);

    assert.equal(totalLines, 5);
    assert.equal(remainingLines, 2);
});

test('completed orders never report negative remaining lines', () => {
    const order = { id: 'ORD-3', status: 'completed', totalItems: 3, items: 0 };
    const cache = { 'ORD-3': [] };

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order, cache);

    assert.equal(totalLines, 3);
    assert.equal(remainingLines, 0);
});

test('orders without cached lines still derive counts from totals', () => {
    const order = { id: 'ORD-4', status: 'pending', totalItems: 3 };

    const { remainingLines, totalLines } = getOrderLineCountsForOrder(order);

    assert.equal(totalLines, 3);
    assert.equal(remainingLines, 3);
});
