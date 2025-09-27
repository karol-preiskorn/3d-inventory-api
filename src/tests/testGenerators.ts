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
import { ObjectId } from 'mongodb'

// Configure casual for deterministic tests
casual.seed(12345)

// Structured builders using test-data-bot for complex objects
const userBuilder = build('User', {
  fields: {
    name: sequence((x) => `User${x}`),
    email: sequence((x) => `user${x}@test.com`),
    password: () => casual.password,
    token: () => casual.password + casual.uuid.slice(0, 20),
    username: sequence((x) => `username${x}`),
    roles: () => [casual.random_element(['admin', 'user', 'moderator'])],
    isActive: () => casual.boolean,
    profile: () => ({
      firstName: casual.first_name,
      lastName: casual.last_name,
      avatar: casual.url,
      bio: casual.sentence
    })
  }
})
const deviceBuilder = build('Device', {
  fields: {
    _id: () => casual.uuid,
    name: sequence((x) => `Device-${x}`),
    modelId: () => casual.uuid,
    position: () => ({
      x: casual.integer(0, 1000),
      y: casual.integer(0, 1000),
      h: casual.integer(0, 100)
    }),
    attributes: () => [
      {
        key: 'type',
        value: casual.random_element(['server', 'switch', 'router', 'storage'])
      },
      {
        key: 'status',
        value: casual.random_element(['active', 'inactive', 'maintenance'])
      },
      {
        key: 'serialNumber',
        value: casual.uuid.slice(0, 12)
      }
    ]
  }
})
const roleBuilder = build('Role', {
  fields: {
    name: sequence((x) => `Role${x}`),
    description: () => casual.sentence,
    permissions: () => casual.array_of_words(3),
    isActive: () => casual.boolean,
    level: () => casual.integer(1, 10)
  }
})
const attributeBuilder = build('Attribute', {
  fields: {
    attributeDictionaryId: () => new ObjectId().toString(),
    connectionId: () => (casual.boolean ? new ObjectId().toString() : null),
    deviceId: () => (casual.boolean ? new ObjectId().toString() : null),
    modelId: () => (casual.boolean ? new ObjectId().toString() : null),
    value: () => casual.word
  }
})
const logBuilder = build('Log', {
  fields: {
    action: () => casual.random_element(['CREATE', 'UPDATE', 'DELETE', 'VIEW']),
    entity: () => casual.random_element(['device', 'user', 'connection', 'model']),
    entityId: () => casual.uuid,
    userId: () => casual.uuid,
    timestamp: () => new Date(),
    details: () => casual.sentence,
    ipAddress: () => casual.ip,
    userAgent: () => 'Mozilla/5.0 Test Agent'
  }
})
const position3d = () => ({
  x: casual.integer(0, 100),
  y: casual.integer(0, 100),
  z: casual.integer(0, 100)
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
    token: casual.password + casual.uuid.slice(0, 20),
    username: casual.username,
    roles: [casual.random_element(['admin', 'user', 'moderator'])],
    isActive: casual.boolean
  }),

  // Role data
  role: () => roleBuilder(),
  roleSimple: () => ({
    name: casual.word + 'Role',
    description: casual.sentence,
    permissions: casual.array_of_words(3),
    isActive: casual.boolean
  }),

  // Attribute data
  attribute: () => attributeBuilder(),
  attributeSimple: () => ({
    attributeDictionaryId: new ObjectId().toString(),
    connectionId: casual.boolean ? new ObjectId().toString() : null,
    deviceId: casual.boolean ? new ObjectId().toString() : null,
    modelId: casual.boolean ? new ObjectId().toString() : null,
    value: casual.word
  }),

  // Log data
  log: () => logBuilder(),
  logSimple: () => ({
    action: casual.random_element(['CREATE', 'UPDATE', 'DELETE', 'VIEW']),
    entity: casual.random_element(['device', 'user', 'connection', 'model']),
    entityId: casual.uuid,
    userId: casual.uuid,
    timestamp: new Date(),
    details: casual.sentence,
    ipAddress: casual.ip,
    userAgent: 'Mozilla/5.0 Test Agent'
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

  position3d,

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
    },
    model: casual.word + 'Model',
    serialNumber: casual.uuid.slice(0, 12)
  }),

  // Model data
  model: () => ({
    name: casual.word + 'Model',
    manufacturer: casual.company_name,
    category: casual.random_element(['server', 'switch', 'router', 'storage']),
    dimensions: {
      width: casual.integer(1, 10),
      height: casual.integer(1, 10),
      depth: casual.integer(1, 10)
    },
    specifications: {
      power: casual.integer(100, 1000) + 'W',
      weight: casual.integer(5, 50) + 'kg'
    }
  }),

  // Connection data
  connection: () => ({
    name: casual.word + ' ' + casual.word,
    type: casual.random_element(['ethernet', 'fiber', 'power']),
    source: {
      deviceId: casual.uuid,
      port: casual.integer(1, 48)
    },
    destination: {
      deviceId: casual.uuid,
      port: casual.integer(1, 48)
    },
    status: casual.random_element(['active', 'inactive', 'error'])
  }),

  // GitHub integration data
  githubData: () => ({
    repository: casual.username + '/' + casual.word,
    branch: casual.random_element(['main', 'develop', 'feature/test']),
    commit: casual.uuid.slice(0, 8),
    author: casual.full_name,
    message: casual.sentence
  }),

  // Health check data
  healthData: () => ({
    status: casual.random_element(['healthy', 'warning', 'critical']),
    checks: {
      database: casual.random_element(['ok', 'error']),
      memory: casual.integer(50, 90) + '%',
      cpu: casual.integer(10, 80) + '%',
      disk: casual.integer(20, 95) + '%'
    },
    uptime: casual.integer(1000, 100000),
    version: '1.0.' + casual.integer(0, 99)
  }),

  // Documentation data
  docData: () => ({
    title: casual.title,
    content: casual.sentences(5),
    category: casual.random_element(['api', 'user-guide', 'technical']),
    tags: casual.array_of_words(3),
    version: '1.' + casual.integer(0, 9),
    lastModified: new Date()
  }),

  // Login/Auth data
  loginData: () => ({
    username: casual.username,
    password: casual.password,
    email: casual.email,
    remember: casual.boolean,
    token: casual.password + casual.uuid.slice(0, 20)
  }),

  // Attributes Dictionary data
  attributesDictionary: () => ({
    name: casual.word + 'Dict',
    category: casual.random_element(['device', 'connection', 'user']),
    attributes: casual.array_of_words(5),
    description: casual.sentence,
    isActive: casual.boolean,
    version: casual.integer(1, 10)
  }),

  // Error and validation data for testing edge cases
  invalidData: {
    emptyString: '',
    nullValue: null,
    undefinedValue: undefined,
    oversizedString: 'x'.repeat(10000),
    negativeNumber: -casual.integer(1, 1000),
    invalidEmail: 'invalid-email',
    invalidUuid: 'not-a-uuid',
    sqlInjection: '\'; DROP TABLE users; --',
    scriptInjection: '<script>alert("xss")</script>',
    nosqlInjection: { $where: 'this.name == "admin"' }
  },

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
  },

  // Generate test data arrays
  generateArray: <T>(generator: () => T, count: number): T[] => {
    return Array.from({ length: count }, generator)
  }
}
