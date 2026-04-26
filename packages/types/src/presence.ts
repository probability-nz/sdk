import type { Prop } from "@automerge/automerge";
/** Automerge property index (string key or array index) */
export type { Prop };
import type { Vector3Tuple } from "./doc";
import type { JsonValue } from "./hashroute";

/**
 * Any valid CSS color string (e.g. `"red"`, `"#abc"`, `"rgb(0,0,0)"`).
 * @group Presence
 */
export type Color = string;

/**
 * Free-form client identifier, intended as `name@version` (e.g. `"my-plugin@1.0.0"`).
 * @group Presence
 */
export type Client = string;

/**
 * A path anchored to a specific Automerge object.
 * First element is always an ObjID string.
 * @example `["2@abc123", "children", 0, "position"]`
 */
export type AnchoredPath = [string, ...Prop[]];

/**
 * Cursor focus (what the user is looking at) — no automerge equivalent
 * @group Presence
 */
export interface FocusOp {
  action: "focus";
  path: AnchoredPath;
}

/**
 * Anchored version of automerge's PutPatch
 * @group Presence
 */
export interface PutOp {
  action: "put";
  path: AnchoredPath;
  value: JsonValue;
  conflict?: boolean;
}

/**
 * Move — no automerge equivalent yet (planned feature)
 * @group Presence
 */
export interface MoveOp {
  action: "move";
  path: AnchoredPath;
  to: AnchoredPath;
}

/**
 * Presence state broadcast between peers
 * @group Presence
 */
export interface PresenceState {
  color?: Color;
  client?: Client;
  op?: PutOp | MoveOp | FocusOp;
  /** @deprecated Old presence format; use `op` instead. */
  cursors?: Record<
    string,
    { position?: Vector3Tuple; rotation?: Vector3Tuple }
  >;
}
