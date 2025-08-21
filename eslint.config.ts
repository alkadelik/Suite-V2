import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import tseslint from "typescript-eslint"
import prettier from "eslint-plugin-prettier"
import prettierConfig from "eslint-config-prettier"
import vueParser from "vue-eslint-parser"
import tsParser from "@typescript-eslint/parser"
import globals from "globals"

export default tseslint.config(
  // Ignore build + tooling files
  {
    ignores: [
      "dist",
      "coverage",
      "node_modules",
      "*.config.*",
      "src/components/common/**",
      "src/components/others",
      "src/directives/**",
    ],
  },

  // Base configs
  js.configs.recommended,
  prettierConfig,

  // ✅ For TS + Vue files (type-aware linting enabled)
  ...tseslint.configs.recommendedTypeChecked,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.{ts,tsx,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        // project: "./tsconfig.app.json", // 👈 point to your typed config
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: { prettier },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-return": "off",

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
