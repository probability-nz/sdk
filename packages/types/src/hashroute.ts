import type { AutomergeUrl as RepoAutomergeUrl } from "@automerge/automerge-repo/slim";

/** Automerge document URL (e.g. `automerge:111111111111111111`). */
export type AutomergeUrl = RepoAutomergeUrl & `automerge:${string}`;

// Named types so typia emits clean $defs names in the JSON schema.
// JsonArray must be an interface — a `type` alias would be a circular reference.
// eslint-disable-next-line typescript-eslint/no-empty-interface
interface JsonArray extends Array<JsonValue> {}
interface JsonObject {
  [key: string]: JsonValue;
}

/** JSON-serializable value */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonArray
  | JsonObject;

/**
 * Connection context passed to plugins via the URL hash
 * @group Core
 */
export interface HashProps {
  /** Automerge document URL */
  doc: AutomergeUrl;
  /** Sync server WebSocket URLs */
  sync: [string, ...string[]];
  /**
   * @experimental Will be a base64url-encoded KeyHive/Beelay Ed25519
   * `Signed<Delegation>`.
   */
  delegation?: string;
}
