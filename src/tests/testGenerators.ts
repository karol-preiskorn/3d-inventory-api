/**
 * Comprehensive test data generators for 3D Inventory API
 * Provides consistent test data generation across all test files
 *
 * Supports all API modules:
 * - Models (3D models)
 * - Devices (inventory items)
 * - Connections (device interconnections)
 * - Floors (locations/layouts)
 * - Users (authentication/RBAC)
 * - Roles (permissions)
 * - Attributes (device properties)
 * - Logs (system events)
 *
 * Benefits:
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

// Common data generators
const generateId = () => casual.integer(100000, 999999).toString()
const generateObjectId = () => casual.uuid.replace(/-/g, '').substring(0, 24)
const generateEmail = () => `${casual.username}@${casual.domain}`
const generatePassword = () => casual.password + casual.integer(100, 999).toString()
// Structured builders using test-data-bot for complex objects
const userBuilder = build('User', {
  fields: {
    id: sequence((x) => `user${x}`),
    username: sequence((x) => `user${x}`),
    email: sequence((x) => `user${x}@test.com`),
    password: () => generatePassword(),
    role: () => casual.random_element(['admin', 'user', 'viewer']),
    isActive: () => casual.boolean,
    token: () => casual.password + casual.uuid.slice(0, 20)
  }
})
const deviceBuilder = build('Device', {
  fields: {
    id: sequence((x) => `device${x}`),
    name: sequence((x) => `Device${x}`),
    modelId: () => generateObjectId(),
    floorId: () => generateObjectId(),
    category: () => casual.random_element(['server', 'switch', 'router', 'storage']),
    type: () => casual.random_element(['rack', 'blade', 'tower', 'appliance']),
    status: () => casual.random_element(['active', 'inactive', 'maintenance', 'decommissioned']),
    position: {
      x: () => casual.integer(1, 100),
      y: () => casual.integer(1, 100),
      h: () => casual.integer(1, 10)
    },
    dimension: {
      width: () => casual.integer(1, 10),
      height: () => casual.integer(1, 10),
      depth: () => casual.integer(1, 10)
    }
  }
})
const modelBuilder = build('Model', {
  fields: {
    id: sequence((x) => `model${x}`),
    name: sequence((x) => `Model${x}`),
    manufacturer: () => casual.company_name,
    modelNumber: () => casual.word.toUpperCase() + '-' + casual.integer(1000, 9999),
    category: () => casual.random_element(['hardware', 'network', 'compute', 'storage']),
    type: () => casual.random_element(['server', 'switch', 'router', 'storage']),
    dimension: {
      width: () => casual.integer(1, 10),
      height: () => casual.integer(1, 10),
      depth: () => casual.integer(1, 10)
    },
    texture: {
      front: () => '/assets/texture/' + casual.word + '.png',
      back: () => '/assets/texture/' + casual.word + '.png',
      side: () => '/assets/texture/' + casual.word + '.png',
      top: () => '/assets/texture/' + casual.word + '.png',
      bottom: () => '/assets/texture/' + casual.word + '.png'
    }
  }
})
const connectionBuilder = build('Connection', {
  fields: {
    id: sequence((x) => `connection${x}`),
    name: sequence((x) => `Connection${x}`),
    deviceIdFrom: () => generateObjectId(),
    deviceIdTo: () => generateObjectId(),
    connectionType: () => casual.random_element(['ethernet', 'fiber', 'power', 'usb']),
    protocol: () => casual.random_element(['tcp', 'udp', 'http', 'https']),
    status: () => casual.random_element(['active', 'inactive', 'error']),
    bandwidth: () => casual.integer(1, 1000) + 'Mbps'
  }
})
const floorBuilder = build('Floor', {
  fields: {
    id: sequence((x) => `floor${x}`),
    name: sequence((x) => `Floor${x}`),
    building: () => casual.company_name + ' Building',
    level: () => casual.integer(1, 20),
    address: {
      street: () => casual.street,
      city: () => casual.city,
      country: () => casual.country,
      postcode: () => casual.integer(10000, 99999).toString()
    },
    dimension: {
      length: () => casual.integer(50, 200),
      width: () => casual.integer(30, 150),
      height: () => casual.integer(3, 5)
    }
  }
})

export const testGenerators = {
  // ===============================
  // BASIC DATA TYPES
  // ===============================
  productName: () => casual.word + ' ' + casual.word + ' ' + casual.word,
  objectId: () => generateObjectId(),
  email: () => generateEmail(),
  password: () => generatePassword(),
  timestamp: () => new Date(),

  // ===============================
  // USER MANAGEMENT
  // ===============================
  user: () => userBuilder(),
  userSimple: () => ({
    username: casual.username,
    email: generateEmail(),
    password: generatePassword(),
    role: casual.random_element(['admin', 'user', 'viewer']),
    isActive: true
  }),

  loginRequest: () => ({
    email: generateEmail(),
    password: generatePassword()
  }),

  role: () => ({
    name: casual.random_element(['admin', 'user', 'viewer', 'manager']),
    permissions: casual.random_element([
      ['read:devices', 'read:models'],
      ['read:devices', 'write:devices', 'read:models'],
      ['read:devices', 'write:devices', 'delete:devices', 'read:models', 'write:models', 'delete:models', 'admin:access']
    ]),
    description: casual.sentence
  }),

  // ===============================
  // MODELS (3D Models)
  // ===============================
  model: () => ({
    name: casual.company_name + ' ' + casual.word,
    manufacturer: casual.company_name,
    modelNumber: casual.word.toUpperCase() + '-' + casual.integer(1000, 9999),
    category: casual.random_element(['hardware', 'network', 'compute', 'storage']),
    type: casual.random_element(['server', 'switch', 'router', 'storage']),
    dimension: {
      width: casual.integer(1, 10),
      height: casual.integer(1, 10),
      depth: casual.integer(1, 10)
    },
    texture: {
      front: '/assets/texture/' + casual.word + '.png',
      back: '/assets/texture/' + casual.word + '.png',
      side: '/assets/texture/' + casual.word + '.png',
      top: '/assets/texture/' + casual.word + '.png',
      bottom: '/assets/texture/' + casual.word + '.png'
    },
    description: casual.sentence,
    specifications: {
      powerConsumption: casual.integer(100, 1000) + 'W',
      weight: casual.integer(5, 50) + 'kg',
      operatingTemp: casual.integer(10, 35) + '°C'
    }
  }),

  modelMinimal: () => ({
    name: casual.company_name + ' ' + casual.word,
    dimension: {
      width: casual.integer(1, 10),
      height: casual.integer(1, 10),
      depth: casual.integer(1, 10)
    },
    texture: {
      front: '/assets/texture/default.png',
      back: '/assets/texture/default.png',
      side: '/assets/texture/default.png',
      top: '/assets/texture/default.png',
      bottom: '/assets/texture/default.png'
    }
  }),

  // ===============================
  // DEVICES (Inventory Items)
  // ===============================
  device: () => deviceBuilder(),
  deviceSimple: () => ({
    name: casual.word + ' ' + casual.word + ' ' + casual.word,
    modelId: generateObjectId(),
    floorId: generateObjectId(),
    category: casual.random_element(['server', 'switch', 'router', 'storage']),
    type: casual.random_element(['rack', 'blade', 'tower', 'appliance']),
    status: casual.random_element(['active', 'inactive', 'maintenance']),
    position: {
      x: casual.integer(1, 100),
      y: casual.integer(1, 100),
      h: casual.integer(1, 10)
    },
    dimensions: {
      width: casual.integer(1, 10),
      height: casual.integer(1, 10),
      depth: casual.integer(1, 10)
    },
    serialNumber: casual.word.toUpperCase() + casual.integer(10000, 99999),
    assetTag: 'AT' + casual.integer(1000, 9999)
  }),

  devicePosition: () => ({
    x: casual.integer(1, 100),
    y: casual.integer(1, 100),
    h: casual.integer(1, 10),
    rotation: casual.integer(0, 360)
  }),

  // ===============================
  // CONNECTIONS (Device Links)
  // ===============================
  connection: () => connectionBuilder(),
  connectionSimple: () => ({
    name: casual.word + ' ' + casual.word + ' Connection',
    deviceIdFrom: generateObjectId(),
    deviceIdTo: generateObjectId(),
    connectionType: casual.random_element(['ethernet', 'fiber', 'power', 'usb']),
    protocol: casual.random_element(['tcp', 'udp', 'http', 'https']),
    status: casual.random_element(['active', 'inactive', 'error']),
    bandwidth: casual.integer(1, 1000) + 'Mbps'
  }),

  networkConnection: () => ({
    name: 'Network ' + casual.word,
    deviceIdFrom: generateObjectId(),
    deviceIdTo: generateObjectId(),
    connectionType: 'ethernet',
    protocol: casual.random_element(['tcp', 'udp']),
    ipAddress: casual.ip,
    port: casual.integer(1024, 65535),
    vlan: casual.integer(1, 4094)
  }),

  // ===============================
  // FLOORS (Locations/Layouts)
  // ===============================
  floor: () => floorBuilder(),
  floorSimple: () => ({
    name: casual.first_name + ' ' + casual.word + ' Floor',
    building: casual.company_name + ' Building',
    level: casual.integer(1, 20),
    address: {
      street: casual.street,
      city: casual.city,
      country: casual.country,
      postcode: casual.integer(10000, 99999).toString()
    },
    dimension: {
      length: casual.integer(50, 200),
      width: casual.integer(30, 150),
      height: casual.integer(3, 5)
    }
  }),

  // ===============================
  // ATTRIBUTES (Device Properties)
  // ===============================
  attribute: () => ({
    name: casual.word + ' Attribute',
    value: casual.word,
    type: casual.random_element(['string', 'number', 'boolean', 'date']),
    category: casual.random_element(['performance', 'configuration', 'metadata']),
    isRequired: casual.boolean,
    description: casual.sentence
  }),

  attributeValue: () => ({
    deviceId: generateObjectId(),
    attributeId: generateObjectId(),
    value: casual.random_element([
      casual.word,
      casual.integer(1, 100).toString(),
      casual.boolean.toString(),
      new Date().toISOString()
    ]),
    lastUpdated: new Date()
  }),

  // ===============================
  // LOGS (System Events)
  // ===============================
  logEntry: () => ({
    level: casual.random_element(['info', 'warn', 'error', 'debug']),
    message: casual.sentence,
    module: casual.random_element(['devices', 'models', 'connections', 'floors', 'users']),
    userId: generateObjectId(),
    deviceId: generateObjectId(),
    action: casual.random_element(['create', 'read', 'update', 'delete']),
    ipAddress: casual.ip,
    userAgent: 'Test Agent',
    details: {
      operation: casual.word,
      duration: casual.integer(1, 1000) + 'ms',
      status: casual.random_element(['success', 'failure', 'timeout'])
    }
  }),

  // ===============================
  // UTILITY DATA
  // ===============================
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

  address: () => ({
    street: casual.street,
    city: casual.city,
    country: casual.country,
    postcode: casual.integer(10000, 99999).toString()
  }),

  // ===============================
  // VALIDATION & ERROR TESTING
  // ===============================
  invalidData: {
    emptyString: '',
    nullValue: null,
    undefinedValue: undefined,
    invalidEmail: 'not-an-email',
    invalidObjectId: 'invalid-id',
    negativeNumber: -1,
    zeroNumber: 0,
    tooLongString: 'x'.repeat(1000),
    sqlInjection: '\'; DROP TABLE users; --',
    scriptInjection: '<script>alert("xss")</script>',
    nosqlInjection: { $where: 'function() { return true; }' }
  },

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================
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

  // Generate unique names with timestamps to avoid conflicts
  uniqueName: (prefix: string = '') => {
    const timestamp = Date.now()
    const random = casual.integer(1000, 9999)

    return `${prefix}${prefix ? ' ' : ''}${casual.word} ${timestamp}${random}`
  },

  // Specialized builders for complex API testing scenarios
  connectionBuilder: () => connectionBuilder(),
  floorBuilder: () => floorBuilder(),
  deviceBuilder: () => deviceBuilder(),

  // Additional position and dimension generators
  position3d: () => ({
    x: casual.integer(-1000, 1000),
    y: casual.integer(-1000, 1000),
    z: casual.integer(-1000, 1000)
  }),

  // Role and permission generators
  roleBuilder: () => ({
    name: testGenerators.uniqueName('Role'),
    permissions: [
      testGenerators.randomArrayElement(['read:devices', 'write:devices', 'delete:devices']),
      testGenerators.randomArrayElement(['read:models', 'write:models', 'delete:models']),
      testGenerators.randomArrayElement(['read:users', 'write:users'])
    ],
    description: casual.sentences(2),
    isActive: casual.boolean,
    hierarchy: casual.integer(1, 10)
  }),

  // Attribute generators
  attributeBuilder: () => ({
    name: testGenerators.uniqueName('Attribute'),
    value: casual.word,
    type: testGenerators.randomArrayElement(['string', 'number', 'boolean', 'array', 'object']),
    modelId: testGenerators.objectId(),
    deviceId: testGenerators.objectId(),
    isRequired: casual.boolean,
    defaultValue: casual.word,
    validation: {
      min: casual.integer(0, 100),
      max: casual.integer(100, 1000),
      pattern: '^[a-zA-Z0-9]*$'
    }
  }),

  // Log generators
  logBuilder: () => ({
    level: testGenerators.randomArrayElement(['info', 'warn', 'error', 'debug']),
    message: casual.sentence,
    component: testGenerators.randomArrayElement(['api', 'database', 'auth', 'devices', 'models']),
    userId: testGenerators.objectId(),
    objectId: testGenerators.objectId(),
    timestamp: new Date(),
    metadata: {
      ip: casual.ip,
      userAgent: 'Test User Agent',
      action: testGenerators.randomArrayElement(['create', 'read', 'update', 'delete'])
    }
  })
}
