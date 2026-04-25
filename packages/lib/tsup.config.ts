import { defineConfig } from "tsup";
import typiaEsbuild from "@typia/unplugin/esbuild";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  external: [/^@probability-nz/, /^@automerge/, /^ajv/],
  esbuildPlugins: [typiaEsbuild()],
});
