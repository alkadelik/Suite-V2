import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import tseslint from "typescript-eslint"
import prettier from "eslint-plugin-prettier"
import prettierConfig from "eslint-config-prettier"
import vueParser from "vue-eslint-parser"
import tsParser from "@typescript-eslint/parser"

export default tseslint.config(
  // Ignore build + tooling files
  { ignores: ["dist", "coverage", "node_modules", "*.config.*"] },

  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...pluginVue.configs["flat/essential"],
  prettierConfig, // Disables conflicting ESLint rules

  // Combined override for TS + Vue
  {
    files: ["**/*.{ts,tsx,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
    plugins: { prettier },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "no-unused-vars": "error",

      // Vue rules
      "vue/multi-word-component-names": "off",
      "vue/no-unused-vars": "error",

      // Prettier formatting as ESLint errors (uses your .prettierrc)
      "prettier/prettier": "error",
    },
  },
)
