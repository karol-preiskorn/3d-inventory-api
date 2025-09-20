/**
 * Test data generators using casual library and test-data-bot
 * Provides consistent test data generation across all test files
 *
 * Benefits of this setup:
 * - Lightweight: casual is ~100KB vs faker.js ~2.5MB
 * - Jest compatible: No module resolution issues
 * - Deterministic: Seeded for consistent test results
 * - Type-safe: Full TypeScript support
 * - Structured: test-data-bot for complex object generation
 */

import { build, sequence } from '@jackfranklin/test-data-bot'
import casual from 'casual'

// Configure casual for deterministic tests
casual.seed(12345)

// Structured builders using test-data-bot for complex objects
const userBuilder = build('User', {
  fields: {
    name: sequence((x) => `User${x}`),
    email: sequence((x) => `user${x}@test.com`),
    password: () => casual.password,
    token: () => casual.password + casual.uuid.slice(0, 20)
  }
})
const deviceBuilder = build('Device', {
  fields: {
    name: sequence((x) => `Device${x}`),
    dimensions: {
      width: () => casual.integer(1, 10),
      height: () => casual.integer(1, 10),
      depth: () => casual.integer(1, 10)
    }
  }
})

export const testGenerators = {
  // Basic data types
  productName: () => casual.word + ' ' + casual.word + ' ' + casual.word,

  // User data - enhanced with test-data-bot
  user: () => userBuilder(),
  userSimple: () => ({
    name: casual.full_name,
    email: casual.email,
    password: casual.password,
    token: casual.password + casual.uuid.slice(0, 20)
  }),

  // Dimensions and coordinates
  dimension: () => ({
    width: casual.integer(1, 10),
    height: casual.integer(1, 10),
    depth: casual.integer(1, 10)
  }),

  coordinates: () => ({
    x: casual.integer(1, 100),
    y: casual.integer(1, 100),
    h: casual.integer(1, 10)
  }),

  // Floor data
  floor: () => ({
    name: casual.first_name + ' ' + casual.word,
    address: {
      street: casual.street,
      city: casual.city,
      country: casual.country,
      postcode: casual.integer(10000, 99999)
    }
  }),

  // Floor name specifically (with capitalization)
  floorName: () => {
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

    return capitalize(casual.first_name) + ' ' + casual.word
  },

  // Address data
  address: () => ({
    street: casual.street,
    city: casual.city,
    country: casual.country,
    postcode: casual.integer(10000, 99999)
  }),

  // Floor dimension data
  floorDimension: () => ({
    description: casual.sentence,
    x: casual.integer(10, 100),
    y: casual.integer(10, 100),
    h: casual.integer(10, 100),
    xPos: casual.integer(10, 100),
    yPos: casual.integer(10, 100),
    hPos: casual.integer(10, 100)
  }),

  // Device/Model data - enhanced with test-data-bot
  device: () => deviceBuilder(),
  deviceSimple: () => ({
    name: casual.word + ' ' + casual.word + ' ' + casual.word,
    dimensions: {
      width: casual.integer(1, 10),
      height: casual.integer(1, 10),
      depth: casual.integer(1, 10)
    }
  }),

  // Connection data
  connection: () => ({
    name: casual.word + ' ' + casual.word
  }),

  // Utility functions
  randomInt: (min: number, max: number) => casual.integer(min, max),
  randomArrayElement: <T>(array: T[]): T => {
    return array[casual.integer(0, array.length - 1)]
  },
  randomArrayElements: <T>(array: T[], count?: { min?: number; max?: number }): T[] => {
    const min = count?.min ?? 1
    const max = count?.max ?? array.length
    const numElements = casual.integer(min, Math.min(max, array.length))
    const result: T[] = []
    const usedIndices = new Set<number>()

    while (result.length < numElements && result.length < array.length) {
      const index = casual.integer(0, array.length - 1)

      if (!usedIndices.has(index)) {
        usedIndices.add(index)
        result.push(array[index])
      }
    }

    return result
  }
}
