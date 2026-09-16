import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/api/v1/testFixtures/**",
      ],
    },
  },
});
