export const SCHEMA_URL =
  "https://registry.probability.nz/npm/@probability-nz/types/-/types-0.0.0.tgz/dist/analog.json";

/**
 * `[x, y, z]` — right-handed Y-up coordinate system (from Three.js).
 * @group Advanced
 */
export type Vector3Tuple = [x: number, y: number, z: number];

/**
 * A named orientation of a piece (e.g. die face)
 * @group Core
 */
export interface Face {
  name: string;
  rotation: Vector3Tuple;
}

/**
 * Piece template — shared fields for pieces
 * @group Core
 */
export interface PieceTemplate {
  name?: string;
  /** Path to a glTF/GLB model */
  src?: string;
  /**
   * Key into the sibling `templates` object to inherit defaults from
   */
  template?: string;
  /**
   * World position in meters.
   * @default [0, 0, 0]
   */
  position?: Vector3Tuple;
  /**
   * Unitless multiplier applied to the model.
   * @default [1, 1, 1]
   */
  scale?: Vector3Tuple;
  /**
   * Euler rotation (degrees)
   * @default [0, 0, 0]
   */
  rotation?: Vector3Tuple;
  /**
   * CSS color string, or null for no tint
   * @default "#808080"
   */
  color?: string | null;
  /**
   * Make piece non-interactive?
   * @default false
   */
  locked?: boolean;
  /** Named face orientations (e.g. for dice) */
  faces?: Face[];
}

/**
 * A game piece in a manifest or document
 * @group Core
 */
export interface Piece extends PieceTemplate {
  children?: Piece[];
}

/**
 * Reusable piece defaults, keyed by template name. Templates can inherit from
 * other templates via the `template` field, and share syntax with pieces minus
 * a `children` property.
 * @example
 * ```jsonc
 * {
 *   "$schema": "https://registry.probability.nz/npm/@probability-nz/types/-/types-0.0.0.tgz/dist/analog.json",
 *   "templates": {
 *     "defaults": { "scale": [0.1, 0.1, 0.1] },
 *     "redToken": { "template": "defaults", "name": "Red token", "src": "redToken.glb" }
 *   },
 *   "children": [
 *     { "template": "redToken", "position": [0.0, 0, 0] },
 *     { "template": "redToken", "position": [0.1, 0, 0] },
 *     { "template": "redToken", "position": [0.2, 0, 0] }
 *   ]
 * }
 * ```
 * @group Core
 */
export type Templates = Record<string, PieceTemplate>;

/**
 * A named starting arrangement of pieces
 * @group Advanced
 */
export interface Scenario {
  name?: string;
  children: Piece[];
}

/**
 * Static game definition — imported to create a new GameState. Similar to a
 * `GameState` but with a `scenarios` array on the root instead of `children`.
 * @example
 * ```jsonc
 * // 2-4 and 4-8 player scenarios
 * {
 *   "$schema": "https://registry.probability.nz/npm/@probability-nz/types/-/types-0.0.0.tgz/dist/analog.json",
 *   "templates": { "token": { "src": "token.glb" } },
 *   "scenarios": [
 *     {
 *       "name": "2-4 player setup",
 *       "children": [
 *         {
 *           "name": "Game board",
 *           "src": "gameboard.glb",
 *           "children": [
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" }
 *           ]
 *         }
 *       ]
 *     },
 *     {
 *       "name": "4-8 player setup",
 *       "children": [
 *         {
 *           "name": "Game board",
 *           "src": "gameboard.glb",
 *           "children": [
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" },
 *             { "template": "token" }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 * @group Advanced
 */
export interface GameManifest {
  $schema: typeof SCHEMA_URL;
  templates: Templates;
  scenarios: Scenario[];
}

type __AutomergeMoves = Record<string, string>;

/**
 * The Automerge document shape — a digital analog of the physical game.
 * Pieces are stacked on each other and positioned relatively.
 * @example
 * ```jsonc
 * // A token, sitting on a card, sitting on a chessboard
 * {
 *   "$schema": "https://registry.probability.nz/npm/@probability-nz/types/-/types-0.0.0.tgz/dist/analog.json",
 *   "templates": {},
 *   "children": [
 *     {
 *       "name": "Chess Board",
 *       "position": [0, 0.1, 0],
 *       "locked": true,
 *       "src": "Chess_Board.glb",
 *       "children": [
 *         {
 *           "name": "card",
 *           "position": [0, 0.002, 0],
 *           "children": [
 *             { "name": "pawn", "position": [0, 0.3, 0], "children": [] }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 * @group Core
 */
export interface GameState {
  $schema: typeof SCHEMA_URL;
  children: Piece[];
  templates: Templates;
  /**
   * Tracks Automerge objectId changes when pieces are reparented.
   * @deprecated Remove when Automerge adds native array move support.
   */
  // Named type so typia emits a clean $defs name in the JSON schema.
  __automergeMoves?: __AutomergeMoves;
}
