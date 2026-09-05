import { defineConfig } from "vitest/config";

const fullyCovered = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
};

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      thresholds: {
        "src/api/v1/post/handlers/handleCreatePost.ts": fullyCovered,
        "src/api/v1/post/postImages.ts": fullyCovered,
        "src/api/v1/storage/imageType.ts": fullyCovered,
      },
    },
  },
});
