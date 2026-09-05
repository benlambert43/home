import { coverageConfigDefaults, defineConfig } from "vitest/config";

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
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/api/v1/testFixtures/**",
      ],
      thresholds: {
        "src/api/v1/post/**": fullyCovered,
        "src/api/v1/fileOperations/**": fullyCovered,
        "src/api/v1/model/postModel.ts": fullyCovered,
        "src/api/v1/schema/postSchema.ts": fullyCovered,
        "src/api/v1/types/db.ts": fullyCovered,
      },
    },
  },
});
