import { describe, expect, it, vi } from "vitest";
import { type GameManifest, SCHEMA_URL } from "@probability-nz/types";
import { createGame } from "./createGame";

const manifest: GameManifest = {
  $schema: SCHEMA_URL,
  templates: { pawn: { name: "Pawn" } },
  scenarios: [{ name: "Default", children: [{ template: "pawn" }] }],
};

describe("createGame", () => {
  it("creates a document via repo.create with the built game state", () => {
    const mockHandle = { url: "automerge:test" };
    const repo = { create: vi.fn(() => mockHandle) };

    const result = createGame(repo as any, manifest, 0);

    expect(repo.create).toHaveBeenCalledOnce();
    expect(repo.create).toHaveBeenCalledWith({
      $schema: SCHEMA_URL,
      children: manifest.scenarios[0]!.children,
      templates: manifest.templates,
    });
    expect(result).toBe(mockHandle);
  });

  it("propagates RangeError from buildGameState", () => {
    const repo = { create: vi.fn() };
    expect(() => createGame(repo as any, manifest, 99)).toThrow(RangeError);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
