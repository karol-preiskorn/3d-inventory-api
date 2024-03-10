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
      displayName: 'esLint',
      clearMocks: true,
      globals: {
        __DEV__: true,
      },
      moduleFileExtensions: ['js', 'mjs', 'cjs', 'json'],
      preset: '@shelf/jest-mongodb',
      runner: 'jest-runner-eslint',
      testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/doc/',
        '<rootDir>/build/',
        '<rootDir>/logs/',
        '<rootDir>/coverage/',
      ],
      testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(mjs?|js?|tsx?|ts?)$',
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
    {
      displayName: 'prettier',
      clearMocks: true,
      globals: {
        __DEV__: true,
      },
      preset: 'jest-runner-prettier',
      runner: 'prettier',
      testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/doc/',
        '<rootDir>/build/',
        '<rootDir>/logs/',
        '<rootDir>/coverage/',
      ],
      transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.(c|m)js$': 'babel-jest',
      },
      moduleFileExtensions: [
        'js',
        'mjs',
        'cjs',
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
        '**/*.cjs',
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
        __DEV__: true,
      },
      moduleFileExtensions: ['js', 'mjs', 'cjs', 'json'],
      preset: '@shelf/jest-mongodb',
      runner: 'jest-runner',
      testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/doc/',
        '<rootDir>/build/',
        '<rootDir>/logs/',
        '<rootDir>/coverage/',
      ],
      testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(mjs?|cjs?|js?|tsx?|ts?)$',
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
  ],
}

module.exports = config
