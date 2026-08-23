import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

import { sharedTsRules } from "../eslint.config.base.mjs";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  sharedTsRules,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
