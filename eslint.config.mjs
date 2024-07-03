// @ts-check

import eslint from '@eslint/js'
import jestPlugin from 'eslint-plugin-jest'
import tseslint from 'typescript-eslint'
import globals from "globals"

export default tseslint.config(
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        ...globals.node,
        ...globals.jest,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
  },

  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['**/docs/**', '**/build/**', '**/dist/**', '*/**/*.d.ts',
      '.git/*',
      '.vscode/*',
      '*/**/node_modules/*',
      'coverage/*',
      'dist/*',
      'docs/*',
      'realm/*',
      'schema/*'],
  },
  eslint.configs['recommended'],
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'jest': jestPlugin,
    },
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
    },
  },
  {
    // disable type-aware linting on JS files
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // enable jest rules on test files
    files: ['test/**'],
    ...jestPlugin.configs['flat/recommended'],
  },
)
