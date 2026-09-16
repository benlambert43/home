import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;
const emptyTestModule = `${root}/test/emptyTestModule.ts`;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${root}/` },
      { find: /^server-only$/, replacement: emptyTestModule },
      { find: /^client-only$/, replacement: emptyTestModule },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
