/**
 * Converts OpenAPI 3.1 output from Typia to standalone JSON Schema 2020-12.
 *
 * Typia outputs OpenAPI 3.1, not plain JSON Schema (samchon/typia#920).
 * This script fixes three incompatibilities:
 * - `additionalItems` → renamed to `items` in 2020-12
 * - `prefixItems` without `minItems` → tuples don't enforce length
 * - `#/components/schemas/` refs → rewritten to `#/$defs/`
 *
 * OpenAPI's `discriminator` keyword is stripped — AJV strict mode rejects
 * unknown keywords, and AJV's built-in discriminator support can't parse
 * typia's `mapping` field.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { SCHEMA_URL } from "@probability-nz/types";
import { typiaOutput } from "./schema-types";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const OPENAPI_REF_PREFIX = "#/components/schemas/";
const JSON_SCHEMA_REF_PREFIX = "#/$defs/";

// Recursively fix OpenAPI vs 2020-12 incompatibilities in a schema node
function fixNode(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(fixNode);
  }
  if (!isObject(node)) {
    return node;
  }

  const entries = Object.entries(node)
    // AJV strict mode rejects OpenAPI's `discriminator` keyword
    .filter(([key]) => key !== "discriminator")
    .map(([key, value]): [string, unknown] => {
      // `additionalItems` was renamed to `items` in JSON Schema 2020-12
      const newKey = key === "additionalItems" ? "items" : key;
      // Typia uses OpenAPI's #/components/schemas/ ref prefix; JSON Schema uses #/$defs/
      if (
        newKey === "$ref" &&
        typeof value === "string" &&
        value.startsWith(OPENAPI_REF_PREFIX)
      ) {
        return [
          newKey,
          JSON_SCHEMA_REF_PREFIX + value.slice(OPENAPI_REF_PREFIX.length),
        ];
      }
      return [newKey, fixNode(value)];
    });

  // Typia emits prefixItems without minItems — add it so tuples enforce length
  const prefix = node["prefixItems"];
  const needsMinItems = Array.isArray(prefix) && !("minItems" in node);

  return Object.fromEntries(
    needsMinItems ? [...entries, ["minItems", prefix.length]] : entries,
  );
}

const typiaSchema = fixNode(typiaOutput);

if (
  !isObject(typiaSchema) ||
  !isObject(typiaSchema["components"]) ||
  !isObject(typiaSchema["components"]["schemas"])
) {
  throw new Error("Unexpected Typia output shape");
}

mkdirSync("dist", { recursive: true });
writeFileSync(
  "dist/analog.json",
  JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: SCHEMA_URL,
      title: "Analog",
      description: "Schema for Probability Automerge documents and presence",
      $ref: "#/$defs/GameState",
      $defs: typiaSchema["components"]["schemas"],
    },
    null,
    2,
  ),
);
