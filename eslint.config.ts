import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import tseslint from "typescript-eslint"
import prettier from "eslint-plugin-prettier"
import prettierConfig from "eslint-config-prettier"
import vueParser from "vue-eslint-parser"
import tsParser from "@typescript-eslint/parser"

export default tseslint.config(
  // Ignore build + tooling files
  { ignores: ["dist", "coverage", "node_modules", "*.config.*", "src/components/common/**", "src/components/others"] },

  // Base configs
  js.configs.recommended,
  prettierConfig,

  // ✅ For plain JS files (no type-aware rules)
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },

  // ✅ For TS + Vue files (type-aware linting enabled)
  ...tseslint.configs.recommendedTypeChecked,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.{ts,tsx,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        project: "./tsconfig.app.json", // 👈 point to your typed config
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
    plugins: { prettier },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // Disable duplicate base rule
      "no-unused-vars": "off",

      // Vue rules
      "vue/multi-word-component-names": "off",
      "vue/no-unused-vars": "error",

      // Prettier
      "prettier/prettier": "error",
    },
  },
)
