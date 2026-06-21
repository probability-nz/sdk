import { describe, expect, it } from "vitest";
import { resolveSchemaValidationEnvironment } from "./schemaValidation";

describe("schema validation mode", () => {
  it("enables development mode outside production", () => {
    expect(resolveSchemaValidationEnvironment({ importMetaEnv: null, nodeEnv: "development" }))
      .toBe(true);
  });

  it("disables development mode in production", () => {
    expect(resolveSchemaValidationEnvironment({ importMetaEnv: null, nodeEnv: "production" }))
      .toBe(false);
  });

  it("prefers import.meta.env when available", () => {
    expect(resolveSchemaValidationEnvironment({
      importMetaEnv: { DEV: false },
      nodeEnv: "development",
    })).toBe(false);
    expect(resolveSchemaValidationEnvironment({
      importMetaEnv: { PROD: true },
      nodeEnv: "development",
    })).toBe(false);
  });
});
