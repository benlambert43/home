// Shared ESLint setup, each workspace's eslint.config.mjs layers its own framework config and ignores on top of this base.

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const TS_FILES = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

const sharedTsRules = {
  files: TS_FILES,
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    "@typescript-eslint/no-floating-promises": [
      "error",
      {
        allowForKnownSafeCalls: [
          {
            from: "package",
            package: "vitest",
            name: ["describe", "it", "test"],
          },
        ],
      },
    ],
  },
};

export const typeChecked = (tsconfigRootDir) => [
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir },
    },
  },
  { files: ["**/*.mjs", "**/*.js"], ...tseslint.configs.disableTypeChecked },
  sharedTsRules,
];

export const typescriptBase = (tsconfigRootDir) =>
  defineConfig([
    { ignores: ["build/**", "coverage/**"] },
    js.configs.recommended,
    ...typeChecked(tsconfigRootDir),
  ]);
