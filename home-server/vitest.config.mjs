import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@home/shared": path.resolve(
        import.meta.dirname,
        "../home-shared/src/index.ts",
      ),
    },
  },
  test: { name: "home-server" },
});
