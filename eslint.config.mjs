import { defineConfig } from "eslint/config";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends(
        "eslint:recommended",
        "plugin:jest/recommended",
        "plugin:prettier/recommended",
        "plugin:promise/recommended",
        "plugin:security/recommended",
        "plugin:sonarjs/recommended",
    ),

    languageOptions: {
        globals: {
            ...globals.node,
        },
    },
}, {
    files: ["**/*.js"],

    languageOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
}, {
    files: ["**/*.ts"],

    extends: compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
    ),

    languageOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        "@typescript-eslint/consistent-indexed-object-style": ["warn"],
        "@typescript-eslint/consistent-type-exports": ["warn"],
        "@typescript-eslint/consistent-type-imports": ["warn"],
        "@typescript-eslint/no-explicit-any": ["error"],
        "@typescript-eslint/return-await": ["error"],
    },
}]);