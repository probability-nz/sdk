import { describe, expect, it } from "vitest";
import { type GameManifest, SCHEMA_VERSION } from "@probability-nz/types";
import { buildGameState } from "./buildGameState";

const manifest: GameManifest = {
  $schema: SCHEMA_VERSION,
  templates: { pawn: { name: "Pawn" } },
  scenarios: [
    { name: "Default", children: [{ template: "pawn" }] },
    { name: "Advanced", children: [{ template: "pawn" }, { template: "pawn" }] },
  ],
};

describe("buildGameState", () => {
  it("builds state from the first scenario", () => {
    const state = buildGameState(manifest, 0);
    expect(state.$schema).toBe(SCHEMA_VERSION);
    expect(state.children).toBe(manifest.scenarios[0]!.children);
    expect(state.templates).toBe(manifest.templates);
  });

  it("selects the correct scenario by index", () => {
    const state = buildGameState(manifest, 1);
    expect(state.children).toHaveLength(2);
  });

  it("throws RangeError for negative index", () => {
    expect(() => buildGameState(manifest, -1)).toThrow(RangeError);
  });

  it("throws RangeError for out-of-bounds index", () => {
    expect(() => buildGameState(manifest, 2)).toThrow(RangeError);
  });

  it("throws RangeError for non-integer index", () => {
    expect(() => buildGameState(manifest, 0.5)).toThrow(RangeError);
  });

  it("throws RangeError for NaN", () => {
    expect(() => buildGameState(manifest, NaN)).toThrow(RangeError);
  });
});
