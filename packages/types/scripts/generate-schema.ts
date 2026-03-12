/**
 * Converts OpenAPI 3.1 output from Typia to standalone JSON Schema 2020-12.
 * To add types, edit the tuple in `openapi.ts`.
 *
 * @note Output includes OpenAPI `discriminator` keywords (ignored by JSON Schema).
 * @fileoverview
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { openapi } from "./openapi";

const schema = JSON.parse(
  JSON.stringify(openapi, (key, value) => {
    if (key === "$ref" && typeof value === "string") {
      return value.replace(/^#\/components\/schemas\//, "#/$defs/");
    }
    return value;
  }),
);

mkdirSync("dist", { recursive: true });
writeFileSync(
  "dist/analog.json",
  JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://probability.nz/schemas/analog/v0",
      title: "Analog",
      description: "Schema for Probability Automerge documents and presence",
      oneOf: schema.schemas,
      $defs: schema.components.schemas ?? {},
    },
    null,
    2,
  ),
);
