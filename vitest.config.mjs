import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["home-shared", "home-server", "home-web-ui"],
    coverage: {
      reporter: ["text", "html"],
      include: [
        "home-shared/src/**",
        "home-server/src/**",
        "home-web-ui/app/**",
      ],
      exclude: ["home-server/src/scripts/**"],
    },
  },
});
