import typia from "typia";
import type { HashContext } from "@probability-nz/types";

/** Un-branded shape for typia validation; HashContext's brand would be treated as a required property. */
interface RawHashContext {
  doc: `automerge:${string}`;
  sync: [string, ...string[]];
  delegation?: string;
}

/**
 * Parse plugin context from the URL hash.
 * @param hash - Expects `location.hash` format (with `#` prefix).
 * @returns `undefined` if the hash is missing or unparseable.
 * @group Core
 */
export const parseHashContext = (hash: string): HashContext | undefined => {
  const raw = hash.slice(1);
  if (raw === "") {
    return undefined;
  }
  try {
    const parsed = typia.assert<RawHashContext>(JSON.parse(decodeURIComponent(raw)));
    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    return parsed as unknown as HashContext;
  } catch {
    return undefined;
  }
};
