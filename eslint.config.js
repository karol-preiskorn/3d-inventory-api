// @ts-check

import { dirname } from 'path'
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import path from 'node:path'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

const ignorePatterns = ['coverage', 'docs/**', 'node_modules/**', 'dist/**', '*.config.js', '*.config.mjs', 'gcs']

export default tseslint.config({
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  ignores: ['coverage/**', 'docs/**', 'node_modules/**', 'dist/**', '*.config.js', '*.config.mjs', 'gcs/**'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
    },
  },
})
