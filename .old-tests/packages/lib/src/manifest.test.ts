import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildGameState, loadManifest } from './manifest';
import { type GameManifest, SCHEMA_VERSION } from '@probability-nz/types';

const VALID_MANIFEST: GameManifest = {
  $schema: SCHEMA_VERSION,
  templates: {
    pawn: { src: './models/pawn.glb' },
  },
  scenarios: [
    {
      name: 'Default',
      children: [
        { name: 'Pawn', src: './models/pawn.glb', template: 'pawn' },
      ],
    },
  ],
};

const BASE_URL = 'https://registry.example.com/game/';

function mockFetch(overrides: Record<string, unknown> = {}) {
  const responses: Record<string, unknown> = {
    [`${BASE_URL}package.json`]: { main: 'manifest.json' },
    [`${BASE_URL}manifest.json`]: VALID_MANIFEST,
    ...overrides,
  };

  return vi.fn((url: string) => {
    const body = responses[url];
    if (body === undefined) {
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
  });
}

describe('loadManifest', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches package.json then manifest via main field', async () => {
    const fetch = mockFetch();
    vi.stubGlobal('fetch', fetch);

    await loadManifest(BASE_URL);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, `${BASE_URL}package.json`);
    expect(fetch).toHaveBeenNthCalledWith(2, `${BASE_URL}manifest.json`);
  });

  it('throws on HTTP error for package.json', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ [`${BASE_URL}package.json`]: undefined }),
    );

    await expect(loadManifest(BASE_URL)).rejects.toThrow(
      /404.*package\.json/,
    );
  });

  it('throws on HTTP error for manifest', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ [`${BASE_URL}manifest.json`]: undefined }),
    );

    await expect(loadManifest(BASE_URL)).rejects.toThrow(/404.*manifest/);
  });

  it('throws when package.json has no main field', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ [`${BASE_URL}package.json`]: { name: 'no-main' } }),
    );

    await expect(loadManifest(BASE_URL)).rejects.toThrow(/missing "main"/);
  });

  it('throws on invalid manifest schema', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        [`${BASE_URL}manifest.json`]: { bad: 'data' },
      }),
    );

    await expect(loadManifest(BASE_URL)).rejects.toThrow(/validation failed/i);
  });

  it('resolves relative src URLs in returned manifest', async () => {
    vi.stubGlobal('fetch', mockFetch());

    const manifest = await loadManifest(BASE_URL);

    expect(manifest.scenarios[0]!.children[0]!.src).toBe(
      `${BASE_URL}models/pawn.glb`,
    );
    expect(manifest.templates['pawn']!.src).toBe(`${BASE_URL}models/pawn.glb`);
  });

  it('resolves src against manifest directory, not package root', async () => {
    const url = 'https://registry.example.com/game/';
    vi.stubGlobal(
      'fetch',
      mockFetch({
        [`${url}package.json`]: { main: 'dist/v2/manifest.json' },
        [`${url}dist/v2/manifest.json`]: VALID_MANIFEST,
      }),
    );

    const manifest = await loadManifest(url);

    expect(manifest.scenarios[0]!.children[0]!.src).toBe(
      `${url}dist/v2/models/pawn.glb`,
    );
  });

  it('preserves absolute src URLs', async () => {
    const absoluteManifest: GameManifest = {
      ...VALID_MANIFEST,
      templates: {
        pawn: { src: 'https://cdn.example.com/pawn.glb' },
      },
      scenarios: [
        {
          children: [
            { src: 'https://cdn.example.com/pawn.glb' },
          ],
        },
      ],
    };
    vi.stubGlobal(
      'fetch',
      mockFetch({ [`${BASE_URL}manifest.json`]: absoluteManifest }),
    );

    const manifest = await loadManifest(BASE_URL);

    expect(manifest.scenarios[0]!.children[0]!.src).toBe(
      'https://cdn.example.com/pawn.glb',
    );
    expect(manifest.templates['pawn']!.src).toBe(
      'https://cdn.example.com/pawn.glb',
    );
  });

  it('resolves nested children src recursively', async () => {
    const nestedManifest: GameManifest = {
      ...VALID_MANIFEST,
      scenarios: [
        {
          children: [
            {
              name: 'parent',
              src: './parent.glb',
              children: [
                {
                  name: 'child',
                  src: './child.glb',
                  children: [{ name: 'grandchild', src: './deep.glb' }],
                },
              ],
            },
          ],
        },
      ],
    };
    vi.stubGlobal(
      'fetch',
      mockFetch({ [`${BASE_URL}manifest.json`]: nestedManifest }),
    );

    const manifest = await loadManifest(BASE_URL);
    const parent = manifest.scenarios[0]!.children[0]!;

    expect(parent.src).toBe(`${BASE_URL}parent.glb`);
    expect(parent.children![0]!.src).toBe(`${BASE_URL}child.glb`);
    expect(parent.children![0]!.children![0]!.src).toBe(`${BASE_URL}deep.glb`);
  });

  it('throws when url does not end with /', async () => {
    await expect(
      loadManifest('https://registry.example.com/game'),
    ).rejects.toThrow(/must end with \//);
  });

  it('leaves empty string src as-is', async () => {
    const emptyManifest: GameManifest = {
      ...VALID_MANIFEST,
      scenarios: [{ children: [{ name: 'no-src', src: '' }] }],
    };
    vi.stubGlobal(
      'fetch',
      mockFetch({ [`${BASE_URL}manifest.json`]: emptyManifest }),
    );

    const manifest = await loadManifest(BASE_URL);

    expect(manifest.scenarios[0]!.children[0]!.src).toBe('');
  });
});

describe('buildGameState', () => {
  const manifest: GameManifest = {
    $schema: SCHEMA_VERSION,
    templates: { pawn: { src: 'https://cdn.example.com/pawn.glb' } },
    scenarios: [
      { name: 'Scenario A', children: [{ name: 'a' }] },
      { name: 'Scenario B', children: [{ name: 'b' }] },
    ],
  };

  it('throws RangeError for out of bounds scenarioIndex', () => {
    expect(() => buildGameState(manifest, 2)).toThrow(RangeError);
    expect(() => buildGameState(manifest, 2)).toThrow(/out of bounds/);
  });

  it('throws RangeError for negative scenarioIndex', () => {
    expect(() => buildGameState(manifest, -1)).toThrow(RangeError);
  });

  it('selects the correct scenario', () => {
    const state = buildGameState(manifest, 1);
    expect(state.children).toEqual([{ name: 'b' }]);
  });

  it('copies $schema from manifest', () => {
    const state = buildGameState(manifest, 0);
    expect(state.$schema).toBe(manifest.$schema);
  });

});
