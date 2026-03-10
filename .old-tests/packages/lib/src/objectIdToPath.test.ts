import { describe, expect, it } from 'vitest';
import { from, getObjectId } from '@automerge/automerge';
import { objectIdToPath } from './objectIdToPath';

function create<T extends Record<string, unknown>>(data: T) {
  return from(data);
}

describe('objectIdToPath', () => {
  it('returns [] for the doc root', () => {
    const doc = create({ a: 1 });
    expect(objectIdToPath(doc, getObjectId(doc)!)).toEqual([]);
  });

  it('finds an object property', () => {
    const doc = create({ nested: { x: 1 } });
    const id = getObjectId(doc.nested)!;
    expect(objectIdToPath(doc, id)).toEqual(['nested']);
  });

  it('finds an object in an array', () => {
    const doc = create({ items: [{ a: 1 }, { b: 2 }] });
    const id = getObjectId(doc.items[1])!;
    expect(objectIdToPath(doc, id)).toEqual(['items', 1]);
  });

  it('finds a deeply nested object', () => {
    const doc = create({ a: [{ b: { c: [{ d: 1 }] } }] });
    const nested = doc.a[0] as { b: { c: { d: number }[] } };
    const id = getObjectId(nested.b.c[0])!;
    expect(objectIdToPath(doc, id)).toEqual(['a', 0, 'b', 'c', 0]);
  });

  it('returns undefined for an unknown ID', () => {
    const doc = create({ a: 1 });
    expect(objectIdToPath(doc, 'unknown-id')).toBeUndefined();
  });

  it('finds the correct sibling among multiple', () => {
    const doc = create({ items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] });
    const id = getObjectId(doc.items[2])!;
    expect(objectIdToPath(doc, id)).toEqual(['items', 2]);
  });
});
