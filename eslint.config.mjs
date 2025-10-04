import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';
import nodePlugin from 'eslint-plugin-n';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base configuration for all files
  {
    ignores: ['node_modules/**', 'lib/**', 'dist/**', '*.js'],
  },

  // JavaScript files
  {
    files: ['**/*.js', '**/*.mjs'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      unicorn,
      n: nodePlugin,
    },
    rules: {
      // ESLint recommended
      ...js.configs.recommended.rules,

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'warn',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // Security rules (replacing eslint-plugin-security)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-caller': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-invalid-this': 'error',
      'no-multi-spaces': 'error',
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',

      // Code quality rules (replacing sonarjs)
      'complexity': ['warn', { max: 15 }],
      'max-depth': ['warn', { max: 4 }],
      'max-nested-callbacks': ['warn', { max: 3 }],
      'max-params': ['warn', { max: 8 }],
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Node.js specific rules
      'n/no-deprecated-api': 'error',
      'n/no-extraneous-import': 'warn', // Can be too strict with TypeScript projects
      'n/no-missing-import': 'off', // TypeScript handles this
      'n/prefer-global/process': 'error',
      'n/prefer-promises/fs': 'error',

      // Unicorn rules for modern JavaScript/TypeScript
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-module': 'off', // We're using CommonJS for some files
      'unicorn/filename-case': ['error', { case: 'kebabCase', ignore: ['\\.test\\.ts$', '\\.spec\\.ts$'] }],
      'unicorn/no-null': 'off', // Allow null in database contexts
      'unicorn/prevent-abbreviations': 'off', // Allow common abbreviations
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'error',
    },
  },

  // Test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'jest/expect-expect': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/prefer-to-have-length': 'warn',
    },
  },

  // Mock files
  {
    files: ['**/__mocks__/**/*.ts'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-undef': 'off', // Jest globals are handled by jest plugin
    },
  },

  // Prettier configuration (must be last)
  prettierConfig,
];