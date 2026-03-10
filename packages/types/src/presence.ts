import type { Prop } from "@automerge/automerge";
export type { Prop };
import type { JsonValue } from "./hashroute";

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
export interface CursorOp {
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
  cursor?: CursorOp;
  op?: PutOp | MoveOp;
}
