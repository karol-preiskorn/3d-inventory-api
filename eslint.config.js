import globals from 'globals'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
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
    languageOptions: { globals: globals.browser }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs['disable-legacy'],
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    commaDangle: 'never',

    jsx: true
  }),
  {
    ignores: [
      'node_modules', 'coverage', 'dist', 'gcs/*', 'src/tests/generateTextures.test.ts'
    ]
  }
]
