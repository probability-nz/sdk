import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '@probability-nz/types';
import { checkGameState, checkManifest, checkPresence, errorsGameState, formatErrors } from './validation';

describe('checkGameState', () => {
  it('accepts a valid game state', () => {
    const doc = {
      $schema: SCHEMA_VERSION,
      children: [],
      templates: {
        d6: { src: '/models/d6.glb', faces: [{ name: 'one', rotation: [0, 0, 0] }] },
      },
    };
    expect(checkGameState(doc)).toBe(true);
  });

  it('rejects extra properties at the top level', () => {
    const doc = {
      $schema: SCHEMA_VERSION,
      children: [],
      templates: {},
      count: 42,
      custom: 'data',
    };
    expect(checkGameState(doc)).toBe(false);
  });

  it('accepts a game state with recursive children', () => {
    const doc = {
      $schema: SCHEMA_VERSION,
      templates: {},
      children: [
        {
          name: 'parent',
          position: [0, 1, 2],
          children: [
            {
              name: 'child',
              position: [3, 4, 5],
              children: [{ name: 'grandchild' }],
            },
          ],
        },
      ],
    };
    expect(checkGameState(doc)).toBe(true);
  });

  it('rejects invalid Vector3Tuple', () => {
    const doc = {
      $schema: SCHEMA_VERSION,
      templates: {},
      children: [{ position: [1, 2] }],
    };
    expect(checkGameState(doc)).toBe(false);
  });

  it('rejects invalid Face', () => {
    const doc = {
      $schema: SCHEMA_VERSION,
      templates: {},
      children: [{ faces: [{ name: 'one' }] }],
    };
    expect(checkGameState(doc)).toBe(false);
  });

  it('rejects wrong $schema version', () => {
    const doc = {
      $schema: 'https://example.com/wrong',
      children: [],
      templates: {},
    };
    expect(checkGameState(doc)).toBe(false);
  });

  it('validates a large tree within a reasonable time', () => {
    const makePiece = (depth: number): Record<string, unknown> => ({
      name: `piece-${depth}`,
      position: [0, 0, 0],
      children: depth > 0 ? Array.from({ length: 3 }, () => makePiece(depth - 1)) : [],
    });
    const doc = { $schema: SCHEMA_VERSION, templates: {}, children: [makePiece(4)] };

    const start = performance.now();
    const valid = checkGameState(doc);
    const elapsed = performance.now() - start;

    expect(valid).toBe(true);
    expect(elapsed).toBeLessThan(500);
  });
});

describe('checkManifest', () => {
  it('accepts a valid manifest', () => {
    expect(checkManifest({
      $schema: SCHEMA_VERSION,
      templates: {},
      scenarios: [{ children: [] }],
    })).toBe(true);
  });

  it('rejects missing required fields', () => {
    expect(checkManifest({ bad: 'data' })).toBe(false);
  });
});

describe('checkPresence', () => {
  it('accepts empty presence', () => {
    expect(checkPresence({})).toBe(true);
  });

  it('accepts a valid cursor op', () => {
    expect(checkPresence({
      cursor: { action: 'focus', path: ['2@abc123', 'children', 0] },
    })).toBe(true);
  });

  it('accepts a valid put op', () => {
    expect(checkPresence({
      op: { action: 'put', path: ['2@abc123', 'position'], value: [1, 2, 3] },
    })).toBe(true);
  });

  it('accepts a valid move op', () => {
    expect(checkPresence({
      op: {
        action: 'move',
        path: ['2@abc123', 'children', 0],
        to: ['3@def456', 'children', 1],
      },
    })).toBe(true);
  });

  it('rejects arbitrary properties', () => {
    expect(checkPresence({ x: 100, y: 200 })).toBe(false);
  });

  it('rejects invalid cursor op', () => {
    expect(checkPresence({
      cursor: { action: 'hover', path: [] },
    })).toBe(false);
  });
});

describe('formatErrors', () => {
  it('formats errors into readable messages', () => {
    const doc = { $schema: SCHEMA_VERSION, templates: {}, children: [{ position: [1, 2] }] };
    const message = formatErrors(errorsGameState(doc));
    expect(message).toContain('Schema validation failed');
    expect(message.length).toBeGreaterThan(25);
  });

  it('returns fallback for empty errors', () => {
    const message = formatErrors([]);
    expect(message).toBe('Schema validation failed');
  });
});
