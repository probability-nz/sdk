# @probability-nz/types

TypeScript types and JSON Schema for Probability documents, presence, and hash-route context. The `./analog.json` subpath ships a JSON Schema 2020-12 for `GameState`, generated from the TS types.

## Build

```sh
pnpm build
```

Compiles TS and regenerates `dist/analog.json` via `scripts/generate-schema/` (uses [typia](https://typia.io/)).
