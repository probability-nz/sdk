/**
 * Converts OpenAPI 3.1 output from Typia to standalone JSON Schema 2020-12.
 * To add types, edit the tuple in `schema-types.ts`.
 *
 * Typia outputs OpenAPI 3.1, not plain JSON Schema (samchon/typia#920).
 * This script fixes two incompatibilities:
 * - `additionalItems` → renamed to `items` in 2020-12
 * - `prefixItems` without `minItems` → tuples don't enforce length
 *
 * OpenAPI's `discriminator` keyword is stripped — AJV strict mode rejects
 * unknown keywords even though the spec allows them.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { SCHEMA_VERSION } from "@probability-nz/types";
import { typiaOutput } from "./schema-types";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Recursively fix OpenAPI/draft-07 incompatibilities in a schema node
function fixNode(node: unknown): unknown {
  const DROP = new Set(["discriminator"]);
  const RENAME: Record<string, string> = { additionalItems: "items" };

  if (Array.isArray(node)) {
    return node.map(fixNode);
  }
  if (!isObject(node)) {
    return node;
  }

  const result: JsonObject = {};
  for (const [key, value] of Object.entries(node)) {
    if (!DROP.has(key)) {
      result[RENAME[key] ?? key] = fixNode(value);
    }
  }

  // Typia emits prefixItems without minItems — add it so tuples enforce length
  const prefix = node["prefixItems"];
  if (Array.isArray(prefix) && !("minItems" in node)) {
    result["minItems"] = prefix.length;
  }
  return result;
}

// Typia uses OpenAPI's #/components/schemas/ ref prefix; JSON Schema uses #/$defs/
const rewritten = JSON.stringify(typiaOutput).replaceAll(
  '"#/components/schemas/',
  '"#/$defs/',
);
const typiaSchema = fixNode(JSON.parse(rewritten));

if (
  !isObject(typiaSchema) ||
  !Array.isArray(typiaSchema["schemas"]) ||
  !isObject(typiaSchema["components"])
) {
  throw new Error("Unexpected Typia output shape");
}

mkdirSync("dist", { recursive: true });
writeFileSync(
  "dist/analog.json",
  JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: SCHEMA_VERSION,
      title: "Analog",
      description: "Schema for Probability Automerge documents and presence",
      oneOf: typiaSchema["schemas"],
      $defs: typiaSchema["components"]["schemas"] ?? {},
    },
    null,
    2,
  ),
);
