/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 * @type {import('jest').Config}
 */

const config = {
  testTimeout: 1000,
  fakeTimers: {
    doNotFake: ['nextTick'],
    timerLimit: 1000,
  },
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
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/doc/', '<rootDir>/dist/', '<rootDir>/docs/', '<rootDir>/logs/', '<rootDir>/coverage/'],
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
      testPathIgnorePatterns: [, '<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/docs/', '<rootDir>/logs/', '<rootDir>/coverage/'],
      transform: {},
      moduleFileExtensions: ['js', 'ts', 'css', 'less', 'scss', 'html', 'json', 'graphql', 'md', 'yaml'],
      testMatch: ['**/*', '**/*.ts', '**/*.css', '**/*.less', '**/*.scss', '**/*.html', '**/*.json', '**/*.graphql', '**/*.md', '**/*.yaml'],
    },
    {
      displayName: 'ts-jest',
      clearMocks: false,
      globals: {
        __DEV__: true,
      },
      moduleFileExtensions: ['js', 'ts', 'yaml', 'json'],
      preset: 'ts-jest',
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/docs/', '<rootDir>/dist/', '<rootDir>/logs/', '<rootDir>/coverage/'],
      testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(mjs?|cjs?|js?|tsx?|ts?)$',
      transform: {},
    },
  ],
}
export default config
