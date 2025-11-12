/**
 * Simplified Jest configuration to fix hanging tests and improve performance
 * @type {import('jest').Config}
 */

const config: import('jest').Config = {
  // Basic configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',

  // Test discovery
  testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/logs/',
    '<rootDir>/coverage/',
    '<rootDir>/docs/'
  ],

  // Module handling
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Transform configuration
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      isolatedModules: true,
      tsconfig: {
        compilerOptions: {
          module: 'commonjs',
          target: 'es2020',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true
        }
      }
    }]
  },

  // Test execution
  testTimeout: 15000, // Reduced from 30s
  maxWorkers: 2, // Limit concurrent tests to reduce hanging
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false, // Changed to false to prevent hanging

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['clover', 'json', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/tests/**/*',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 70,
      statements: 70
    }
  },

  // Performance optimizations
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  verbose: false, // Reduce verbose output to improve performance
  bail: false, // Don't bail on first failure to see all issues

  // Handle ESM and CommonJS modules
  extensionsToTreatAsEsm: [],
  globals: {
    'ts-jest': {
      useESM: false
    }
  }
}

export default config
