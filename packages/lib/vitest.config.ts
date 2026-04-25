import { defineConfig } from "vitest/config";
import typiaVite from "@typia/unplugin/vite";

export default defineConfig({
  plugins: [typiaVite()],
});
