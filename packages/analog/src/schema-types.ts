/**
 * Typia schema extraction — types to include go in the tuple below.
 *
 * @note `@default` JSDoc tags are not emitted (https://github.com/samchon/typia/issues/211).
 */

import typia from "typia";
import type { GameManifest, GameState, PresenceState } from "@probability-nz/types";

export const typiaOutput = typia.json.schemas<
  [GameManifest, GameState, PresenceState]
>();
