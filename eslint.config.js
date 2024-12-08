// @ts-check

import * as tsParser from '@typescript-eslint/parser'
import * as tseslint from '@typescript-eslint/eslint-plugin'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import markdown from '@eslint/markdown'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      ...tseslint.configs.strict.rules,
      ...tseslint.configs.stylistic.rules,
      ...tseslint.configs['stylistic-type-checked'].rules,
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
    ignores: ['coverage/**', 'docs/**', 'node_modules/**', 'dist/**', '*.config.js', '*.config.mjs', 'gcs/**', 'src/tests/**/*.test.js'],
  },
  {
    files: ['**/*.md'],
    plugins: {
      markdown,
    },
    processor: 'markdown/markdown',
  },
]
