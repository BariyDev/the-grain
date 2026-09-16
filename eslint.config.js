import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginImport from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImports from "eslint-plugin-unused-imports";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";

export default defineConfig([
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { sourceType: "module" },
    },
  },
  {
    ignores: [
      "node_modules",
      "**/dist/**",
      "drizzle/**",
      "client/public/**",
      "**/*.d.ts",
      "**/*.config.(c?[jt]s?(x))",
      "**/vite.config.ts",
    ],
  },
  {
    files: ["server/**/*.ts", "drizzle.config.ts"],
    extends: [
      js.configs.recommended,
      perfectionist.configs["recommended-natural"],
      eslintPluginImport.flatConfigs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      unicorn.configs.recommended,
      eslintConfigPrettier,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "unused-imports": unusedImports },
    settings: {
      "import/resolver": {
        typescript: { project: ["./tsconfig.json"] },
        node: true,
      },
    },
    rules: {
      "max-lines-per-function": ["error", { max: 100, skipBlankLines: true, skipComments: true }],
      "unicorn/no-null": "off",
      "unicorn/prefer-classlist-toggle": "off",
      "unicorn/name-replacements": "off",
      "unicorn/prefer-string-raw": "off",
      "unicorn/filename-case": "off",
      "perfectionist/sort-modules": "off",
      "perfectionist/sort-objects": "off",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    files: ["client/**/*.{ts,vue}"],
    extends: [
      js.configs.recommended,
      perfectionist.configs["recommended-natural"],
      eslintPluginImport.flatConfigs.recommended,
      ...tseslint.configs.recommended,
      unicorn.configs.recommended,
      eslintConfigPrettier,
    ],
    plugins: { "unused-imports": unusedImports },
    settings: {
      "import/resolver": {
        typescript: { project: ["./client/tsconfig.app.json"] },
        node: true,
      },
    },
    rules: {
      "max-lines-per-function": ["error", { max: 100, skipBlankLines: true, skipComments: true }],
      "unicorn/no-null": "off",
      "unicorn/prefer-classlist-toggle": "off",
      "unicorn/name-replacements": "off",
      "unicorn/prefer-string-raw": "off",
      "unicorn/prefer-await": "off",
      "unicorn/filename-case": "off",
      "perfectionist/sort-modules": "off",
      "perfectionist/sort-objects": "off",
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    files: ["client/**/*.vue"],
    extends: [...vue.configs["flat/recommended"], eslintConfigPrettier],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
  },
]);
