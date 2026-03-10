import { describe, expect, it, vi } from 'vitest';
import { SCHEMA_VERSION, type GameManifest } from '@probability-nz/types';

const mocks = vi.hoisted(() => ({
  mockCreate: vi.fn((state: unknown) => ({ url: 'automerge:test', ...state as object })),
}));

vi.mock('@automerge/react', () => ({
  Repo: vi.fn(),
}));

import { createGame } from './createGame';

const MANIFEST: GameManifest = {
  $schema: SCHEMA_VERSION,
  templates: { pawn: { src: 'https://cdn.example.com/pawn.glb' } },
  scenarios: [
    { name: 'Default', children: [{ name: 'Pawn', template: 'pawn' }] },
    { name: 'Alt', children: [{ name: 'Knight' }] },
  ],
};

const mockRepo = { create: mocks.mockCreate } as any;

describe('createGame', () => {
  it('creates a document with the selected scenario', () => {
    createGame(mockRepo, MANIFEST, 0);

    expect(mocks.mockCreate).toHaveBeenCalledWith({
      $schema: SCHEMA_VERSION,
      children: [{ name: 'Pawn', template: 'pawn' }],
      templates: { pawn: { src: 'https://cdn.example.com/pawn.glb' } },
    });
  });

  it('selects the correct scenario by index', () => {
    createGame(mockRepo, MANIFEST, 1);

    expect(mocks.mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        children: [{ name: 'Knight' }],
      }),
    );
  });

  it('returns the document handle from repo.create', () => {
    const handle = createGame(mockRepo, MANIFEST, 0);
    expect(handle).toHaveProperty('url', 'automerge:test');
  });

  it('throws for out-of-bounds scenario index', () => {
    expect(() => createGame(mockRepo, MANIFEST, 5)).toThrow(RangeError);
  });
});
