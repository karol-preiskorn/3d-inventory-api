/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 * @type {import('jest').Config}
 */
const config = {
  bail: 1,
  verbose: true,
  coverageProvider: 'v8',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'EsLint',
      clearMocks: true,
      globals: {
        __DEV__: true
      },
      moduleFileExtensions: ['js', 'mjs', 'cjs', 'json'],
      preset: '@shelf/jest-mongodb',
      runner: 'jest-runner-eslint',
      testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(mjs?|js?|tsx?|ts?)$',
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
    {
      displayName: 'Prettier',
      clearMocks: true,
      globals: {
        __DEV__: true
      },
      preset: 'jest-runner-prettier',
      runner: 'prettier',
      testPathIgnorePatterns: ['<rootDir>/node_modules/'],
      transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.jsx?$': 'babel-jest'
      },
      moduleFileExtensions: [
        'js',
        'mjs',
        'jsx',
        'vue',
        'ts',
        'tsx',
        'css',
        'less',
        'scss',
        'html',
        'json',
        'graphql',
        'md',
        'markdown',
        'mdx',
        'yaml',
        'yml',
      ],
      testMatch: [
        '**/*.js',
        '**/*.mjs',
        '**/*.jsx',
        '**/*.vue',
        '**/*.ts',
        '**/*.tsx',
        '**/*.css',
        '**/*.less',
        '**/*.scss',
        '**/*.html',
        '**/*.json',
        '**/*.graphql',
        '**/*.md',
        '**/*.markdown',
        '**/*.mdx',
        '**/*.yaml',
        '**/*.yml',
      ],
    },
    {
      displayName: 'Jest',
      clearMocks: false,
      globals: {
        __DEV__: true
      },
      moduleFileExtensions: ['js', 'mjs', 'cjs', 'json'],
      preset: '@shelf/jest-mongodb',
      runner: 'jest-runner',
      testPathIgnorePatterns: ['<rootDir>/node_modules/'],
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(mjs?|js?|tsx?|ts?)$',
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
  ]
}

module.exports = config
