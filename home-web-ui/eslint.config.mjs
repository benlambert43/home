import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

import { typeChecked } from "../eslint.config.base.mjs";

const eslintConfig = [
  { ignores: [".next/**", "out/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...typeChecked(import.meta.dirname),
];

export default eslintConfig;
