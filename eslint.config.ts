// eslint.config.js

import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig(
  [globalIgnores(['dist', 'node_modules', 'coverage', 'logs', 'scripts', 'gcs', 'eslint.config.js'])],
  [
    js.configs.recommended,
    {
      files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
      languageOptions: { sourceType: 'commonjs' },
      ignores: [
        'node_modules', 'coverage', 'dist', 'gcs', 'scripts', 'logs'
      ]
    },
    {
      ignores: ['dist', 'node_modules', 'coverage', 'logs', 'scripts', 'gcs'],
      files: ['**/*.ts', '**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],

      languageOptions: {
        parser: tsparser,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module'
        },
        globals: {
          ...globals.node
        }
      },
      plugins: {
        '@typescript-eslint': tseslint
      },
      rules: {
        ...(tseslint.configs?.recommended?.rules || {}),
        'indent': ['error', 2],
        'quotes': ['error', 'single'],
        // Disallow semicolons; ensure this matches your code style
        'comma-dangle': ['error', 'never'],
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: 'function', next: 'function' },
          // Optional: add padding before return statements for readability
          { blankLine: 'always', prev: '*', next: 'return' },
          // Optional: add padding after variable declarations
          { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' }
        ]
      }
    }
  ])
