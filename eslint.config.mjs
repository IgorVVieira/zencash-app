import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // eslint-plugin-react bundled in eslint-config-next calls context.getFilename()
  // which was removed in ESLint 10. Setting an explicit version bypasses auto-detection.
  {
    settings: {
      react: {
        version: "19",
      },
    },
    rules: {
      // Flags valid React patterns (localStorage hydration, form init from props, etc.)
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
