/**
 * Validate a value against a schema.
 * @returns Array of error messages; empty means valid.
 * @remarks Stub — always passes. Will use ArkType once schema generation is wired up.
 */
export default function validate(_schema: unknown, _value: unknown, _type: string): string[] {
  return [];
}

/**
 * Validate a value against a schema, throwing on failure.
 * @throws On schema validation failure.
 */
export function assertValid(schema: unknown, value: unknown, type: string): void {
  const errors = validate(schema, value, type);
  if (errors.length > 0) {
    throw new Error(`Schema validation failed:\n${errors.join("\n")}`);
  }
}
