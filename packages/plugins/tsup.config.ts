import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react/index.ts"],
  format: ["esm"],
  dts: true,
  external: [/^@probability-nz/, /^@automerge/, /^react/],
});
