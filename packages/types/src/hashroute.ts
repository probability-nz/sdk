/** Automerge document URL (e.g. `automerge:111111111111111111`) */
export type AutomergeUrl = `automerge:${string}`;

/** JSON-serializable value */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Connection context passed to plugins via the URL hash
 * @group Core
 */
export interface HashContext {
  /** Automerge document URL */
  doc: AutomergeUrl;
  /** Sync server WebSocket URLs */
  sync: [string, ...string[]];
  /**
   * @experimental Will be a base64url-encoded KeyHive/Beelay Ed25519
   * `Signed<Delegation>`. Currently ignored — all values fail validation.
   */
  delegation?: string;
}
