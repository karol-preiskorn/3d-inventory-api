import globals from 'globals'
import tseslint from '@typescript-eslint/eslint-plugin'

// ESLint flat config format (ESM export)
export default [
  {
    files: ['**/*.{js,ts}'],
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
    plugins: {
      '@typescript-eslint': tseslint
    },
    languageOptions: {
      globals: globals.browser,
      parser: await import('@typescript-eslint/parser'),
      ecmaVersion: 2021
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        { 'blankLine': 'always', 'prev': 'function', 'next': 'function' }
      ]
    }
  }
]
