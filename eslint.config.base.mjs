// Shared ESLint setup, each workspace's eslint.config.mjs layers its own framework config and ignores on top of this base.

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const TS_FILES = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

export const sharedTsRules = {
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
  },
};

export const typescriptBase = ({
  typeChecked = false,
  tsconfigRootDir,
} = {}) => {
  const tsConfigs = typeChecked
    ? [
        ...tseslint.configs.recommendedTypeChecked,
        {
          languageOptions: {
            parserOptions: { projectService: true, tsconfigRootDir },
          },
        },
        {
          files: ["**/*.mjs", "**/*.js"],
          ...tseslint.configs.disableTypeChecked,
        },
      ]
    : [...tseslint.configs.recommended];

  return defineConfig([js.configs.recommended, ...tsConfigs, sharedTsRules]);
};
