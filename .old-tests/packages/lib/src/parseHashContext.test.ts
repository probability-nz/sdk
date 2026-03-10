import { describe, expect, it } from 'vitest';
import { parseHashContext } from './parseHashContext';

const makeHash = (state: Record<string, unknown>) =>
  '#' + encodeURIComponent(JSON.stringify(state));

describe('parseHashContext', () => {
  it('parses a valid context from a hash string', () => {
    const hash = makeHash({
      doc: 'automerge:abc123',
      sync: ['wss://sync.example.com'],
    });
    const ctx = parseHashContext(hash);
    expect(ctx).toBeDefined();
    expect(ctx?.doc).toBe('automerge:abc123');
    expect(ctx?.sync).toEqual(['wss://sync.example.com']);
  });

  it('returns undefined for empty hash', () => {
    expect(parseHashContext('')).toBeUndefined();
  });

  it('returns undefined for hash with only #', () => {
    expect(parseHashContext('#')).toBeUndefined();
  });

  it('returns undefined for malformed JSON', () => {
    expect(parseHashContext('#not-valid-json')).toBeUndefined();
  });

  it('returns undefined when doc is missing', () => {
    expect(parseHashContext(makeHash({ sync: ['wss://sync.example.com'] }))).toBeUndefined();
  });

  it('returns undefined when doc is not a valid automerge URL', () => {
    expect(parseHashContext(makeHash({ doc: 'not-automerge', sync: ['wss://sync.example.com'] }))).toBeUndefined();
  });

  it('returns undefined when sync is empty', () => {
    expect(parseHashContext(makeHash({ doc: 'automerge:abc123', sync: [] }))).toBeUndefined();
  });

  it('includes delegation when present', () => {
    const ctx = parseHashContext(makeHash({
      doc: 'automerge:abc123',
      sync: ['wss://sync.example.com'],
      delegation: 'dGVzdC1kZWxlZ2F0aW9u',
    }));
    expect(ctx?.delegation).toBe('dGVzdC1kZWxlZ2F0aW9u');
  });
});
