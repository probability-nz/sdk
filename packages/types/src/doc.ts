export const SCHEMA_VERSION = "https://probability.nz/schemas/analog/v0";

/**
 * `[x, y, z]` — right-handed Y-up coordinate system (from Three.js).
 * @group Advanced
 */
export type Vector3Tuple = [x: number, y: number, z: number];

/** @group Core */
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
  /** Key into templates to inherit defaults from */
  template?: string;
  position?: Vector3Tuple;
  scale?: Vector3Tuple;
  /** Euler rotation (degrees) */
  rotation?: Vector3Tuple;
  /** CSS color string, or null for no tint */
  color?: string | null;
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

/** @group Core */
export type Templates = Record<string, PieceTemplate>;

/**
 * A named starting arrangement of pieces
 * @group Advanced
 */
export interface Scenario {
  name?: string;
  children: Piece[];
}

/** @group Advanced */
export interface GameManifest {
  $schema: typeof SCHEMA_VERSION;
  templates: Templates;
  scenarios: Scenario[];
}

/**
 * The Automerge document shape — a digital analog of the physical game.
 * @group Core
 */
export interface GameState {
  $schema: typeof SCHEMA_VERSION;
  children: Piece[];
  templates: Templates;
  /**
   * Tracks Automerge objectId changes when pieces are reparented.
   * @deprecated Remove when Automerge adds native array move support.
   */
  __automergeMoves?: Record<string, string>;
}
