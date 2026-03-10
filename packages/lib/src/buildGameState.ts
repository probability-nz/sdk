import type { GameManifest, GameState } from "@probability-nz/types";

/**
 * Build a GameState from a loaded manifest and scenario index.
 * @throws {RangeError} If scenarioIndex is out of bounds.
 * @see {@link loadManifest} for fetching the manifest.
 */
export function buildGameState(
  { $schema, scenarios, templates }: GameManifest,
  scenarioIndex: number,
): GameState {
  if (scenarioIndex < 0 || scenarioIndex >= scenarios.length || !Number.isInteger(scenarioIndex)) {
    throw new RangeError(
      `buildGameState: scenarioIndex ${scenarioIndex} out of bounds (${scenarios.length} scenarios)`,
    );
  }

  return {
    $schema,
    children: scenarios[scenarioIndex]!.children,
    templates,
  };
}
