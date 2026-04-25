import { beforeEach, describe, expect, it, vi } from "vitest";
import { SCHEMA_URL } from "@probability-nz/types";
import { loadManifest } from "./manifest";

const PLUGIN_URL = "https://registry.example.com/plugins/chess/";

const mockPackageJson = { main: "./dist/manifest.json" };
const mockManifest = {
  $schema: SCHEMA_URL,
  templates: {
    pawn: { name: "Pawn", src: "./models/pawn.glb" },
    king: { name: "King" },
  },
  scenarios: [
    {
      name: "Default",
      children: [{ template: "pawn", src: "./models/pawn.glb" }, { template: "king" }],
    },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(responses: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const body = responses[url];
      if (body === undefined) {
        return Promise.resolve({ ok: false, status: 404 });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(structuredClone(body)),
      });
    }),
  );
}

function setupFetch() {
  mockFetch({
    [`${PLUGIN_URL}package.json`]: mockPackageJson,
    [`${PLUGIN_URL}dist/manifest.json`]: mockManifest,
  });
}

describe("loadManifest", () => {
  it("throws if url does not end with /", async () => {
    await expect(loadManifest("https://example.com")).rejects.toThrow("must end with /");
  });

  it("throws if package.json has no main field", async () => {
    mockFetch({ [`${PLUGIN_URL}package.json`]: {} });
    await expect(loadManifest(PLUGIN_URL)).rejects.toThrow(/\$input\.main/);
  });

  it("throws if main is an absolute URL", async () => {
    mockFetch({ [`${PLUGIN_URL}package.json`]: { main: "https://evil.com/payload.json" } });
    await expect(loadManifest(PLUGIN_URL)).rejects.toThrow("must be a relative path");
  });

  it("throws if main escapes the base directory", async () => {
    mockFetch({ [`${PLUGIN_URL}package.json`]: { main: "/../../../etc/passwd" } });
    await expect(loadManifest(PLUGIN_URL)).rejects.toThrow("must be a relative path");
  });

  it("throws on fetch failure", async () => {
    mockFetch({});
    await expect(loadManifest(PLUGIN_URL)).rejects.toThrow("404");
  });

  describe("with a valid manifest", () => {
    const ctx = {} as { result: Awaited<ReturnType<typeof loadManifest>> };
    beforeEach(async () => {
      setupFetch();
      ctx.result = await loadManifest(PLUGIN_URL);
    });

    it("resolves relative src URLs in templates", () => {
      expect(ctx.result.templates["pawn"]!.src).toBe(`${PLUGIN_URL}dist/models/pawn.glb`);
    });

    it("leaves templates without src unchanged", () => {
      expect(ctx.result.templates["king"]!.src).toBeUndefined();
    });

    it("preserves non-src fields on templates", () => {
      expect(ctx.result.templates["pawn"]!.name).toBe("Pawn");
    });

    it("resolves relative src URLs in scenario children", () => {
      expect(ctx.result.scenarios[0]!.children[0]!.src).toBe(`${PLUGIN_URL}dist/models/pawn.glb`);
    });
  });

  it("resolves nested children recursively", async () => {
    const nested = {
      ...mockManifest,
      scenarios: [
        {
          name: "Nested",
          children: [
            {
              template: "group",
              children: [{ name: "Child", src: "./models/child.glb" }],
            },
          ],
        },
      ],
    };
    mockFetch({
      [`${PLUGIN_URL}package.json`]: mockPackageJson,
      [`${PLUGIN_URL}dist/manifest.json`]: nested,
    });

    const result = await loadManifest(PLUGIN_URL);
    expect(result.scenarios[0]!.children[0]!.children![0]!.src).toBe(
      `${PLUGIN_URL}dist/models/child.glb`,
    );
  });

  it("does not mutate the fetched manifest", async () => {
    const original = structuredClone(mockManifest);
    setupFetch();
    await loadManifest(PLUGIN_URL);
    expect(mockManifest).toEqual(original);
  });
});
