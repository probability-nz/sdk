# Contributing

## CLA

All contributors must sign the [Contributor License Agreement](./CLA.md) before their first PR can be merged. This is automated — the CLA bot will comment on your PR with instructions.

## Code Style

Write code that explains itself. Add comments when it can't.

Before writing a comment, ask: can I rename, extract a constant, or restructure to make this obvious? If not, comment the *why*.

## JSDoc

Document public exports. Document module-level functions when the name and types aren't enough. Don't repeat what types already say.

Each package entry point should have a `@packageDocumentation` comment.

Tag order:
1. Summary line
2. `@param` / `@returns` / `@defaultValue`
3. `@throws`
4. `@remarks`
5. `@example` (fenced code block)
6. `@see` — with reason when non-obvious
7. `@experimental` / `@deprecated` / `@internal`
8. `@group` — for docs page grouping (Core, Presence, Advanced)

Use `@internal` on module-level functions that aren't exported. This flags accidental exposure if exports change.

## For AI Agents

- Your training data may be outdated, especially for browser quirks and library APIs - search online for current information
