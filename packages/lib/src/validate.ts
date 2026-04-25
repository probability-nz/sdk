import Ajv2020 from "ajv/dist/2020";
import type { GameState, PresenceState } from "@probability-nz/types";

interface JsonSchema {
  $id: string;
}

const cache = new WeakMap<object, Ajv2020>();

function getAjv(schema: object): Ajv2020 {
  let ajv = cache.get(schema);
  if (!ajv) {
    ajv = new Ajv2020({ strictTuples: false });
    ajv.compile(schema);
    cache.set(schema, ajv);
  }
  return ajv;
}

function assertValid(schema: JsonSchema, value: unknown, ref: string): void {
  const ajv = getAjv(schema);
  const validate = ajv.getSchema(ref);
  if (!validate) {
    throw new Error(`Validator not found in schema ${schema.$id}`);
  }
  // AJV's ValidateFunction returns `boolean | Promise<unknown>`; we only use sync schemas
  if (validate(value) !== true) {
    throw new Error(`Validation failed: ${ajv.errorsText(validate.errors)}`);
  }
}

/**
 * Assert that `value` is a valid `GameState` for the given schema.
 * @throws On validation failure.
 */
export function assertGameState(
  schema: JsonSchema,
  value: unknown,
): asserts value is GameState {
  // Root of the schema is `$ref: "#/$defs/GameState"`, so the root validator is the GameState validator
  assertValid(schema, value, schema.$id);
}

/**
 * Assert that `value` is a valid `PresenceState` for the given schema.
 * @throws On validation failure.
 */
export function assertPresenceState(
  schema: JsonSchema,
  value: unknown,
): asserts value is PresenceState {
  assertValid(schema, value, `${schema.$id}#/$defs/PresenceState`);
}
