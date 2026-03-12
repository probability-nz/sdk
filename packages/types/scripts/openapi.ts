/**
 * Typia schema extraction — types to include go in the tuple below.
 *
 * @note `@default` JSDoc tags are not emitted (https://github.com/samchon/typia/issues/211).
 */

import typia from "typia";
import type { GameManifest, GameState } from "../src/doc";
import type { PresenceState } from "../src/presence";

export const openapi = typia.json.schemas<
  [GameManifest, GameState, PresenceState],
  "3.1"
>();
