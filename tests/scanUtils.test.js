import assert from 'node:assert/strict';
import test from 'node:test';
import { findMatchingItems, normalizeScanCode } from '../scanUtils.js';

test('normalizeScanCode removes spaces, normalizes case and leading zeros', () => {
    assert.equal(normalizeScanCode(' sku-0092 '), 'SKU-92');
    assert.equal(normalizeScanCode('loc-001-05'), 'LOC-1-5');
    assert.equal(normalizeScanCode('  pk-02-010 '), 'PK-2-10');
});

test('findMatchingItems matches SKU codes regardless of case or leading zeros', () => {
    const items = [
        { id: 'SKU-0092', location: 'PK-02-009' },
        { id: 'BOX-10', location: 'PK-02-01' },
    ];

    const { matchedItems, matchedBy } = findMatchingItems('sku-92', items);

    assert.equal(matchedBy, 'id');
    assert.equal(matchedItems.length, 1);
    assert.equal(matchedItems[0].id, 'SKU-0092');
});

test('findMatchingItems falls back to matching locations with flexible formatting', () => {
    const items = [
        { id: 'SKU-0981', location: 'PK-02-010' },
        { id: 'PAL-200', location: 'DOCK-04' },
    ];

    const { matchedItems, matchedBy } = findMatchingItems('pk-2-10', items);

    assert.equal(matchedBy, 'location');
    assert.equal(matchedItems.length, 1);
    assert.equal(matchedItems[0].id, 'SKU-0981');
});

test('findMatchingItems returns no matches for unknown codes', () => {
    const items = [{ id: 'SKU-0092', location: 'PK-02-009' }];

    const { matchedItems, matchedBy } = findMatchingItems('UNKNOWN-1', items);

    assert.equal(matchedBy, null);
    assert.equal(matchedItems.length, 0);
});
