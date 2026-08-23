import { typescriptBase } from "../eslint.config.base.mjs";

export default [
  { ignores: ["build/**"] },
  ...typescriptBase({
    typeChecked: true,
    tsconfigRootDir: import.meta.dirname,
  }),
];
