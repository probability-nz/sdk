import { describe, expect, it } from "vitest";
import validate, { assertValid } from "./validate";

describe("validate", () => {
  it("returns an empty array (stub)", () => {
    const schema = { type: "object" };
    const gameState = { children: [{ template: "pawn" }] };
    expect(validate(schema, gameState, "GameState")).toEqual([]);
  });
});

describe("assertValid", () => {
  it("does not throw when validate returns no errors", () => {
    const schema = { type: "object" };
    const gameState = { children: [] };
    assertValid(schema, gameState, "GameState");
  });
});
