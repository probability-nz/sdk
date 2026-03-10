import type { HashContext } from "@probability-nz/types";
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
    // TODO: Validate against schema
    return JSON.parse(decodeURIComponent(raw)) as HashContext;
  } catch {
    return undefined;
  }
};
