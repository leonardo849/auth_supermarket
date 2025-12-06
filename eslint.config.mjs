import tseslint from "typescript-eslint";
import js from "@eslint/js";
import { rules as prettierRules } from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "*.config.js",
    ]
  },
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }
      ],
      ...prettierRules
    }
  }
];
