import { describe, expect, it } from "vitest";
import { toColor } from "./toColor";

describe("toColor", () => {
  it("returns a 7-character hex string", () => {
    const color = toColor("test");
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("is deterministic — same input always produces same output", () => {
    expect(toColor("player-1")).toBe(toColor("player-1"));
  });

  it("produces different colors for different inputs", () => {
    const a = toColor("player-1");
    const b = toColor("player-2");
    expect(a).not.toBe(b);
  });

  it("handles empty string", () => {
    expect(toColor("")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("handles unicode", () => {
    expect(toColor("日本語")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
