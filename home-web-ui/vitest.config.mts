import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;
const emptyModule = `${root}/test/emptyModule.ts`;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${root}/` },
      { find: /^server-only$/, replacement: emptyModule },
      { find: /^client-only$/, replacement: emptyModule },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
