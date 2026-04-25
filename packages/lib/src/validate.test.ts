import { describe, expect, it } from "vitest";
import { SCHEMA_URL } from "@probability-nz/types";
import analogSchema from "@probability-nz/types/analog.json" with { type: "json" };
import { assertGameState, assertPresenceState } from "./validate";

const schema = analogSchema;
const $schema = SCHEMA_URL;

describe("assertGameState", () => {
  it("accepts a minimal state", () => {
    assertGameState(schema, { $schema, children: [], templates: {} });
  });

  it("throws on missing children", () => {
    expect(() => {
      assertGameState(schema, { $schema, templates: {} });
    }).toThrow(/Validation failed/);
  });

  it("throws on wrong $schema", () => {
    expect(() => {
      assertGameState(schema, {
        $schema: "https://example.com/invalid-schema.json",
        children: [],
        templates: {},
      });
    }).toThrow(/Validation failed/);
  });
});

describe("assertPresenceState", () => {
  it("accepts empty presence", () => {
    assertPresenceState(schema, {});
  });

  it("accepts a cursor focus op", () => {
    assertPresenceState(schema, {
      cursor: { action: "focus", path: ["1@abc", "children", 0] },
    });
  });

  it("throws on malformed path", () => {
    expect(() => {
      assertPresenceState(schema, {
        cursor: { action: "focus", path: [42, "children"] },
      });
    }).toThrow(/Validation failed/);
  });
});
