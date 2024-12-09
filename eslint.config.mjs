export default [
  {
    files: [
      '**/*.{js,mjs,cjs,ts,mts,jsx,tsx}'
    ],
    languageOptions: {
      // common parser options, enable TypeScript and JSX
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module'
      }
    }
  }
]
