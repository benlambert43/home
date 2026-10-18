import path from "node:path";

import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

import { typeChecked } from "../eslint.config.base.mjs";

const eslintConfig = [
  { ignores: [".next/**", "out/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...typeChecked(import.meta.dirname),
  {
    rules: {
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: path.join(import.meta.dirname, "app/globals.css"),
      },
    },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": [
        "error",
        { rootFontSize: 16, collapse: false },
      ],
      "better-tailwindcss/no-conflicting-classes": "error",
    },
  },
];

export default eslintConfig;
