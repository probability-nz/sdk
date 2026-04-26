import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  external: [/^@probability-nz/, /^@automerge/, /^react/],
});
