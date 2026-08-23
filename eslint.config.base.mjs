// Shared ESLint setup. Single source of truth for the rules every workspace agrees on;
// each workspace's eslint.config.mjs layers its own framework config and ignores on top.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

const TS_FILES = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

/** Rule overrides applied in every workspace, framework config or not. */
export const sharedTsRules = {
  files: TS_FILES,
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        // `catch (e)` that never touches `e` is the codebase's house style.
        caughtErrors: "none",
        // `const { secret, ...rest } = body` is omission, not an unused binding.
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
};

/** Base config for a plain (non-framework) TypeScript workspace. */
export const typescriptBase = tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  sharedTsRules,
);
