import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/build/**",
    "**/coverage/**",
    "**/.next/**",
    "**/out/**",
    "**/next-env.d.ts",
  ]),
  tseslint.configs.base,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: repoRoot },
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      parserOptions: {
        project: path.join(here, "tsconfig.json"),
        tsconfigRootDir: repoRoot,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"],
    rules: { "@typescript-eslint/no-deprecated": "error" },
  },
]);
