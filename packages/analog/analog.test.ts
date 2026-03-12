import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import { SCHEMA_VERSION } from "@probability-nz/types";
import { describe, expect, it } from "vitest";

interface AnalogSchema {
  $schema: string;
  $id: string;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

const schema = readJson<AnalogSchema>(resolve(__dirname, "dist/analog.json"));

// Compile the full schema (meta-validates it as valid 2020-12)
const ajv = new Ajv2020();
ajv.compile(schema);

// Per-type validators via $defs
const validateManifest = ajv.getSchema(`${schema.$id}#/$defs/GameManifest`)!;
const validateState = ajv.getSchema(`${schema.$id}#/$defs/GameState`)!;
const validatePresence = ajv.getSchema(`${schema.$id}#/$defs/PresenceState`)!;

const $schema = SCHEMA_VERSION;

function expectValid(validate: ValidateFunction, doc: unknown) {
  if (!validate(doc)) {
    expect.fail(
      `Expected valid, got errors:\n${JSON.stringify(validate.errors, null, 2)}`,
    );
  }
}

describe("analog.json meta-validation", () => {
  it("is valid JSON Schema 2020-12", () => {
    // Compile above throws if the schema itself is invalid
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.$id).toBe(SCHEMA_VERSION);
  });
});

describe("GameManifest", () => {
  it("accepts a minimal manifest", () => {
    expectValid(validateManifest, { $schema, templates: {}, scenarios: [] });
  });

  it("accepts a manifest with pieces and templates", () => {
    expectValid(validateManifest, {
      $schema,
      templates: {
        pawn: { name: "Pawn", src: "./pawn.glb", position: [0, 0, 0] },
      },
      scenarios: [
        { children: [{ template: "pawn", position: [1, 2, 3] }] },
      ],
    });
  });

  it("rejects missing $schema", () => {
    expect(validateManifest({ templates: {}, scenarios: [] })).toBe(false);
  });

  it("rejects missing templates", () => {
    expect(validateManifest({ $schema, scenarios: [] })).toBe(false);
  });

  it("rejects missing scenarios", () => {
    expect(validateManifest({ $schema, templates: {} })).toBe(false);
  });
});

describe("GameState", () => {
  it("accepts a minimal state", () => {
    expectValid(validateState, { $schema, children: [], templates: {} });
  });

  it("accepts nested pieces", () => {
    expectValid(validateState, {
      $schema,
      templates: {},
      children: [
        {
          name: "board",
          children: [{ name: "piece", position: [0, 0.1, 0] }],
        },
      ],
    });
  });

  it("accepts __automergeMoves", () => {
    expectValid(validateState, {
      $schema,
      children: [],
      templates: {},
      __automergeMoves: { "1@abc": "2@def" },
    });
  });

  it("rejects missing children", () => {
    expect(validateState({ $schema, templates: {} })).toBe(false);
  });
});

describe("PresenceState", () => {
  it("accepts empty presence", () => {
    expectValid(validatePresence, {});
  });

  it("accepts cursor focus", () => {
    expectValid(validatePresence, {
      cursor: { action: "focus", path: ["1@abc", "children", 0] },
    });
  });

  it("accepts a put op", () => {
    expectValid(validatePresence, {
      op: {
        action: "put",
        path: ["1@abc", "position"],
        value: [1, 2, 3],
      },
    });
  });

  it("accepts a move op", () => {
    expectValid(validatePresence, {
      op: {
        action: "move",
        path: ["1@abc", "children", 0],
        to: ["2@def", "children", 1],
      },
    });
  });
});

describe("Vector3Tuple", () => {
  it("accepts exactly 3 numbers", () => {
    expectValid(validateManifest, {
      $schema, templates: {}, scenarios: [{ children: [{ position: [1, 2, 3] }] }],
    });
  });

  it("rejects 2 numbers", () => {
    expect(validateManifest({
      $schema, templates: {}, scenarios: [{ children: [{ position: [1, 2] }] }],
    })).toBe(false);
  });

  it("rejects 4 numbers", () => {
    expect(validateManifest({
      $schema, templates: {}, scenarios: [{ children: [{ position: [1, 2, 3, 4] }] }],
    })).toBe(false);
  });

  it("rejects strings in tuple", () => {
    expect(validateManifest({
      $schema, templates: {}, scenarios: [{ children: [{ position: ["a", "b", "c"] }] }],
    })).toBe(false);
  });
});

describe("Piece", () => {
  it("accepts color as string", () => {
    expectValid(validateManifest, {
      $schema, templates: {}, scenarios: [{ children: [{ color: "#ff0000" }] }],
    });
  });

  it("accepts color as null", () => {
    expectValid(validateManifest, {
      $schema, templates: {}, scenarios: [{ children: [{ color: null }] }],
    });
  });

  it("rejects color as number", () => {
    expect(validateManifest({
      $schema, templates: {}, scenarios: [{ children: [{ color: 42 }] }],
    })).toBe(false);
  });

  it("accepts faces array", () => {
    expectValid(validateManifest, {
      $schema,
      templates: {},
      scenarios: [{
        children: [{
          faces: [{ name: "1", rotation: [0, 0, 0] }, { name: "6", rotation: [180, 0, 0] }],
        }],
      }],
    });
  });

  it("rejects face missing required name", () => {
    expect(validateManifest({
      $schema,
      templates: {},
      scenarios: [{ children: [{ faces: [{ rotation: [0, 0, 0] }] }] }],
    })).toBe(false);
  });

  it("rejects face missing required rotation", () => {
    expect(validateManifest({
      $schema,
      templates: {},
      scenarios: [{ children: [{ faces: [{ name: "1" }] }] }],
    })).toBe(false);
  });

  it("rejects locked as non-boolean", () => {
    expect(validateManifest({
      $schema, templates: {}, scenarios: [{ children: [{ locked: "yes" }] }],
    })).toBe(false);
  });
});

describe("Templates", () => {
  it("validates template values as PieceTemplate", () => {
    expectValid(validateManifest, {
      $schema,
      templates: { token: { name: "Token", src: "./token.glb" } },
      scenarios: [],
    });
  });

  it("rejects invalid template values", () => {
    expect(validateManifest({
      $schema, templates: { bad: { position: [1, 2] } }, scenarios: [],
    })).toBe(false);
  });
});

describe("Scenario", () => {
  it("rejects scenario without children", () => {
    expect(validateManifest({
      $schema, templates: {}, scenarios: [{ name: "Missing children" }],
    })).toBe(false);
  });
});

describe("$schema field", () => {
  it("rejects wrong $schema value", () => {
    expect(validateManifest({
      $schema: "https://wrong.url", templates: {}, scenarios: [],
    })).toBe(false);
  });
});

describe("AnchoredPath", () => {
  it("accepts string first element followed by string and number props", () => {
    expectValid(validatePresence, {
      cursor: { action: "focus", path: ["1@abc", "children", 0, "position"] },
    });
  });

  it("rejects number as first element", () => {
    expect(validatePresence({
      cursor: { action: "focus", path: [42, "children"] },
    })).toBe(false);
  });

  it("rejects boolean in path", () => {
    expect(validatePresence({
      cursor: { action: "focus", path: ["1@abc", true] },
    })).toBe(false);
  });
});
