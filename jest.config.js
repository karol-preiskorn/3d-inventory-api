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
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: true }]],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'esLint',
      clearMocks: true,
      globals: {
        __DEV__: true,
      },
      moduleFileExtensions: ['ts', 'json'],
      preset: '@shelf/jest-mongodb',
      runner: 'jest-runner-eslint',
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/doc/', '<rootDir>/build/', '<rootDir>/logs/', '<rootDir>/coverage/'],
      testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(mjs?|js?|tsx?|ts?)$',
      transform: {},
    },
    {
      displayName: 'prettier',
      clearMocks: true,
      globals: {
        __DEV__: true,
      },
      preset: 'jest-runner-prettier',
      runner: 'prettier',
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/doc/', '<rootDir>/build/', '<rootDir>/logs/', '<rootDir>/coverage/'],
      transform: {},
      moduleFileExtensions: ['js', 'ts', 'css', 'less', 'scss', 'html', 'json', 'graphql', 'md', 'yaml'],
      testMatch: ['**/*.js', '**/*.ts', '**/*.css', '**/*.less', '**/*.scss', '**/*.html', '**/*.json', '**/*.graphql', '**/*.md', '**/*.yaml'],
    },
    {
      displayName: 'Jest',
      clearMocks: false,
      globals: {
        __DEV__: true,
      },
      moduleFileExtensions: ['js', 'ts', 'yaml', 'json'],
      preset: '@shelf/jest-mongodb',
      runner: 'jest-runner',
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/doc/', '<rootDir>/build/', '<rootDir>/logs/', '<rootDir>/coverage/'],
      testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(mjs?|cjs?|js?|tsx?|ts?)$',
      transform: {},
    },
  ],
}

module.exports = config
