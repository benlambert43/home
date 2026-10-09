import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": import.meta.dirname,
      "@home/shared": path.resolve(
        import.meta.dirname,
        "../home-shared/src/index.ts",
      ),
    },
  },
  test: {
    name: { label: "home-web-ui", color: "green" },
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
