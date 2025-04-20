import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'

/** @type {import('eslint').Linter.Config} */
export default [
  // https://eslint.org/docs/latest/use/configure/ignore
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ignores: [
      'node_modules', 'coverage', 'dist', 'gcs/*'
    ]
  },
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
    ignores: [
      'node_modules', 'coverage', 'dist', 'gcs/*'
    ]
  },
  {
    languageOptions: {
      globals: globals.browser,
      parser: '@typescript-eslint/parser',
      ecmaVersion: 2021,
  {
    // Include recommended TypeScript ESLint rules for better type safety and linting
    ...tseslint.configs.recommended,
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'never']
    }
  },
  // Including recommended configuration from @eslint/js for general best practices
  pluginJs.configs.recommended,
  {
    ignores: [
      'node_modules', 'coverage', 'dist', 'gcs/*', 'src/tests/generateTextures.test.ts'
    ]
  }
]
