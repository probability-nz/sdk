import { describe, expect, it } from "vitest";
import { DEV } from "./dev";

describe("DEV", () => {
  it("is true in test environment (NODE_ENV=test)", () => {
    expect(DEV).toBe(true);
  });
});
