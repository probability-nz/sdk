import typia from "typia";
import type { GameManifest } from "@probability-nz/types";

interface PackageJson {
  main: string;
}

/** @internal */
const fetchJson = async (url: string): Promise<unknown> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`loadManifest: ${res.status} fetching ${url}`);
  }
  return res.json();
};

/** @internal Recursively resolve relative `src` URLs against a base. */
const resolveSrc = <T extends { src?: string; children?: T[] }>(node: T, base: string): T => ({
  ...node,
  ...(node.src !== undefined && { src: new URL(node.src, base).href }),
  ...(node.children && {
    children: node.children.map((n) => resolveSrc(n, base)),
  }),
});

/**
 * Fetch a game manifest, resolving asset URLs.
 * @param url - Must end with `/`.
 * @throws On network errors, missing `main` field, or schema validation failure.
 * @example
 * ```ts
 * const manifest = await loadManifest('https://registry.probability.nz/games/chess/');
 * ```
 * @see {@link buildGameState} for the next step after loading.
 * @group Advanced
 */
export async function loadManifest(url: string): Promise<GameManifest> {
  if (!url.endsWith("/")) {
    throw new Error("loadManifest: url must end with /");
  }

  const pkg = typia.assert<PackageJson>(await fetchJson(`${url}package.json`));
  const manifestUrl = new URL(pkg.main, url).href;
  if (!manifestUrl.startsWith(url)) {
    throw new Error('loadManifest: "main" must be a relative path');
  }
  const manifest = typia.assert<GameManifest>(await fetchJson(manifestUrl));
  const base = new URL(".", manifestUrl).href;

  const templates = Object.fromEntries(
    Object.entries(manifest.templates).map(([k, v]) => [k, resolveSrc(v, base)]),
  );
  const scenarios = manifest.scenarios.map((s) => ({
    ...s,
    children: s.children.map((c) => resolveSrc(c, base)),
  }));

  return { ...manifest, templates, scenarios };
}
