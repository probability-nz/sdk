import typia from "typia";
import type { HashProps } from "@probability-nz/types";

/** Un-branded shape for typia validation; HashProps's brand would be treated as a required property. */
interface RawHashProps {
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
export const parseHashProps = (hash: string): HashProps | undefined => {
  const raw = hash.slice(1);
  if (raw === "") {
    return undefined;
  }
  try {
    const parsed = typia.assert<RawHashProps>(JSON.parse(decodeURIComponent(raw)));
    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    return parsed as unknown as HashProps;
  } catch {
    return undefined;
  }
};
