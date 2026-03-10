import type { Repo } from "@automerge/react";
import { type GameManifest, buildGameState } from "@probability-nz/lib";

/**
 * Create a new game document from a manifest and scenario index.
 * @throws {RangeError} If scenarioIndex is out of bounds.
 * @see {@link buildGameState} for building state without creating a document.
 * @group Advanced
 */
export function createGame(repo: Repo, manifest: GameManifest, scenarioIndex: number) {
  return repo.create(buildGameState(manifest, scenarioIndex));
}
