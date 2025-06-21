/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 * @type {import('jest').Config}
 */

const config: import('jest').Config = {
  testTimeout: 3000,
  rootDir: '.',
  fakeTimers: {
    doNotFake: ['nextTick'],
    timerLimit: 3000
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
      statements: -10
    }
  },
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  projects: [
    {
      displayName: 'ts-jest',
      clearMocks: true,
      globals: {
        __DEV__: true
      },
      moduleFileExtensions: ['js', 'ts', 'yaml', 'json'],
      preset: 'ts-jest',
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/docs/', '<rootDir>/dist/', '<rootDir>/logs/', '<rootDir>/coverage/'],
      testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(mjs?|cjs?|js?|tsx?|ts?)$',
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
      }
    }
  ]
}
export default config
