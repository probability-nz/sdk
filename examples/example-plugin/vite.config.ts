import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [basicSsl(), react(), wasm()],
  server: { port: 3020 },
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    exclude: ["@automerge/automerge-wasm"],
  },
});
