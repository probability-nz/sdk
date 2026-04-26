# @probability-nz/types

TypeScript types and JSON Schema for Probability documents, presence, and hash-route context.

## Exports

- `./` — TS types (`GameState`, `GameManifest`, `Piece`, `PresenceState`, `HashProps`, …) and the `SCHEMA_URL` constant.
- `./analog.json` — JSON Schema 2020-12 for `GameState`, generated from the TS types.

## Build

```sh
pnpm build
```

Compiles TS and regenerates `dist/analog.json` via `scripts/generate-schema/` (uses [typia](https://typia.io/)).
