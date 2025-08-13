import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'logs/**',
      'scripts/**',
      'gcs/**',
      'docs/**',
      '*.config.js',
      'package*.json'
    ]
  },

  // JavaScript files
  {
    ...js.configs.recommended,
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'comma-dangle': ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'function', next: 'function' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' }
      ]
    }
  }
];
