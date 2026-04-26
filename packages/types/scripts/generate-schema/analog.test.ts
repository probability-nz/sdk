import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import { SCHEMA_URL } from "@probability-nz/types";
import { describe, expect, it } from "vitest";

interface AnalogSchema {
  $schema: string;
  $id: string;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

const schema = readJson<AnalogSchema>(resolve(import.meta.dirname, "../../dist/analog.json"));

// Compile the full schema (meta-validates it as valid 2020-12).
// `strictTuples: false` permits head-rest tuples (AnchoredPath = [string, ...Prop[]]);
// AJV's default wants `items: false` or `maxItems`, but our rest is typed and unbounded.
const ajv = new Ajv2020({ strictTuples: false });
ajv.compile(schema);

// Per-type validators via $defs
const validateState = ajv.getSchema(`${schema.$id}#/$defs/GameState`)!;
const validatePresence = ajv.getSchema(`${schema.$id}#/$defs/PresenceState`)!;

const $schema = SCHEMA_URL;

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
    expect(schema.$id).toBe(SCHEMA_URL);
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

  it("accepts a focus op", () => {
    expectValid(validatePresence, {
      op: { action: "focus", path: ["1@abc", "children", 0] },
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
    expectValid(validateState, {
      $schema, templates: {}, children: [{ position: [1, 2, 3] }],
    });
  });

  it("rejects 2 numbers", () => {
    expect(validateState({
      $schema, templates: {}, children: [{ position: [1, 2] }],
    })).toBe(false);
  });

  it("rejects 4 numbers", () => {
    expect(validateState({
      $schema, templates: {}, children: [{ position: [1, 2, 3, 4] }],
    })).toBe(false);
  });

  it("rejects strings in tuple", () => {
    expect(validateState({
      $schema, templates: {}, children: [{ position: ["a", "b", "c"] }],
    })).toBe(false);
  });
});

describe("Piece", () => {
  it("accepts color as string", () => {
    expectValid(validateState, {
      $schema, templates: {}, children: [{ color: "#ff0000" }],
    });
  });

  it("accepts color as null", () => {
    expectValid(validateState, {
      $schema, templates: {}, children: [{ color: null }],
    });
  });

  it("rejects color as number", () => {
    expect(validateState({
      $schema, templates: {}, children: [{ color: 42 }],
    })).toBe(false);
  });

  it("accepts faces array", () => {
    expectValid(validateState, {
      $schema,
      templates: {},
      children: [{
        faces: [{ name: "1", rotation: [0, 0, 0] }, { name: "6", rotation: [180, 0, 0] }],
      }],
    });
  });

  it("rejects face missing required name", () => {
    expect(validateState({
      $schema,
      templates: {},
      children: [{ faces: [{ rotation: [0, 0, 0] }] }],
    })).toBe(false);
  });

  it("rejects face missing required rotation", () => {
    expect(validateState({
      $schema,
      templates: {},
      children: [{ faces: [{ name: "1" }] }],
    })).toBe(false);
  });

  it("rejects locked as non-boolean", () => {
    expect(validateState({
      $schema, templates: {}, children: [{ locked: "yes" }],
    })).toBe(false);
  });
});

describe("Templates", () => {
  it("validates template values as PieceTemplate", () => {
    expectValid(validateState, {
      $schema,
      templates: { token: { name: "Token", src: "./token.glb" } },
      children: [],
    });
  });

  it("rejects invalid template values", () => {
    expect(validateState({
      $schema, templates: { bad: { position: [1, 2] } }, children: [],
    })).toBe(false);
  });
});

describe("$schema field", () => {
  it("rejects wrong $schema value", () => {
    expect(validateState({
      $schema: "https://example.com/invalid-schema.json", templates: {}, children: [],
    })).toBe(false);
  });
});

describe("AnchoredPath", () => {
  it("accepts string first element followed by string and number props", () => {
    expectValid(validatePresence, {
      op: { action: "focus", path: ["1@abc", "children", 0, "position"] },
    });
  });

  it("rejects number as first element", () => {
    expect(validatePresence({
      op: { action: "focus", path: [42, "children"] },
    })).toBe(false);
  });

  it("rejects boolean in path", () => {
    expect(validatePresence({
      op: { action: "focus", path: ["1@abc", true] },
    })).toBe(false);
  });
});
