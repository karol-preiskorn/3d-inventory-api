---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.ts'
description: TypeScript Strict Mode Configuration and Enforcement
---

# TypeScript Strict Mode Configuration

This document provides detailed TypeScript strict mode configuration and enforcement guidelines for the 3D Inventory projects.

## Required tsconfig.json Configuration

### API Project (Node.js/Express)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Strict Mode Options (All Required)
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

### UI Project (Angular)

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"],

    // Angular Strict Template Options
    "strictTemplates": true,
    "strictInputAccessModifiers": true,
    "strictInputTypes": true,
    "strictNullInputTypes": true,
    "strictAttributeTypes": true,
    "strictSafeNavigationTypes": true,
    "strictDomLocalRefTypes": true,
    "strictOutputEventTypes": true,
    "strictDomEventTypes": true,
    "strictContextGenerics": true,
    "strictLiteralTypes": true,

    // Additional Strict Options
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true,
    "strictInputTypes": true
  }
}
```

## Strict Mode Compliance Patterns

### 1. No Implicit Any

```typescript
// ✅ CORRECT - Explicit types
export interface UserService {
  getUser(id: string): Promise<User | null>
  createUser(userData: CreateUserRequest): Promise<User>
  updateUser(id: string, updates: Partial<User>): Promise<User>
}

export const validateUser = (user: User): ValidationResult => {
  const errors: string[] = []

  if (!user.username || user.username.length < 3) {
    errors.push('Username must be at least 3 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ❌ INCORRECT - Implicit any types
export const validateUser = (user) => {
  // Error: Parameter 'user' implicitly has an 'any' type
  // Implementation
}

export const processData = (data) => {
  // Error: Parameter 'data' implicitly has an 'any' type
  return data.map((item) => item.value) // Error: 'item' implicitly has an 'any' type
}
```

### 2. Strict Null Checks

```typescript
// ✅ CORRECT - Null safety
export const getUserById = async (id: string): Promise<User | null> => {
  const user = await userCollection.findOne({ _id: new ObjectId(id) })
  return user || null
}

export const displayUserName = (user: User | null): string => {
  if (user === null) {
    return 'Unknown User'
  }

  // TypeScript knows user is not null here
  return user.username
}

export const safePropertyAccess = (user: User | undefined): string => {
  return user?.username ?? 'No username'
}

// ❌ INCORRECT - Unsafe null access
export const displayUserName = (user: User | null): string => {
  return user.username // Error: Object is possibly 'null'
}

export const unsafeAccess = (users: User[]): string => {
  return users[0].username // Error: Object is possibly 'undefined'
}
```

### 3. Strict Function Types

```typescript
// ✅ CORRECT - Proper function typing
type EventHandler<T> = (event: T) => void
type AsyncHandler<T, R> = (data: T) => Promise<R>

export const createEventEmitter = <T>(): {
  on: (handler: EventHandler<T>) => void
  emit: (event: T) => void
} => {
  const handlers: EventHandler<T>[] = []

  return {
    on: (handler: EventHandler<T>) => {
      handlers.push(handler)
    },
    emit: (event: T) => {
      handlers.forEach((handler) => handler(event))
    },
  }
}

// Function with proper error handling
export const withErrorHandling = <T, R>(fn: (data: T) => Promise<R>): ((data: T) => Promise<R | Error>) => {
  return async (data: T) => {
    try {
      return await fn(data)
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error))
    }
  }
}

// ❌ INCORRECT - Loose function typing
export const createHandler = (callback) => {
  // Error: Missing type annotation
  return (data) => callback(data) // Error: Implicit any
}
```

### 4. Strict Property Initialization

```typescript
// ✅ CORRECT - Proper property initialization
export class DatabaseService {
  private client!: MongoClient // Definite assignment assertion when initialized elsewhere
  private readonly config: DatabaseConfig
  private connected: boolean = false

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    this.client = new MongoClient(this.config.uri)
    await this.client.connect()
    this.connected = true
  }
}

// Angular component with proper initialization
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  users: User[] = [] // Initialize with empty array
  selectedUser: User | null = null
  loading = signal(false) // Initialize with default value

  private readonly userService = inject(UserService)

  ngOnInit(): void {
    this.loadUsers()
  }
}

// ❌ INCORRECT - Uninitialized properties
export class BadService {
  private client: MongoClient // Error: Property has no initializer
  private users: User[] // Error: Property has no initializer
  private config: Config // Error: Property has no initializer
}
```

### 5. No Unchecked Indexed Access

```typescript
// ✅ CORRECT - Safe array/object access
export const getConfigValue = (config: Record<string, string>, key: string): string | undefined => {
  const value = config[key] // Type: string | undefined
  return value
}

export const safeArrayAccess = <T>(array: T[], index: number): T | undefined => {
  return array[index] // Type: T | undefined
}

export const processUsers = (users: User[]): string[] => {
  return users.map((user, index) => {
    // Safe access with index check
    const nextUser = index + 1 < users.length ? users[index + 1] : undefined
    return nextUser ? `${user.username} -> ${nextUser.username}` : user.username
  })
}

// ❌ INCORRECT - Unchecked indexed access
export const unsafeAccess = (users: User[]): string => {
  return users[0].username // Error: Object is possibly 'undefined'
}

export const unsafeConfig = (config: Record<string, string>): string => {
  return config['missing-key'].toUpperCase() // Error: Object is possibly 'undefined'
}
```

## Advanced Type Safety Patterns

### 1. Discriminated Unions

```typescript
// ✅ CORRECT - Type-safe state management
type LoadingState<T> = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }

export const handleLoadingState = <T>(state: LoadingState<T>): string => {
  switch (state.status) {
    case 'idle':
      return 'Ready to load'
    case 'loading':
      return 'Loading...'
    case 'success':
      return `Loaded ${JSON.stringify(state.data)}` // TypeScript knows data exists
    case 'error':
      return `Error: ${state.error}` // TypeScript knows error exists
    default:
      const exhaustive: never = state // Ensures all cases are handled
      throw new Error(`Unhandled state: ${exhaustive}`)
  }
}
```

### 2. Branded Types

```typescript
// ✅ CORRECT - Type-safe IDs
declare const __brand: unique symbol
type Brand<T, TBrand> = T & { [__brand]: TBrand }

type UserId = Brand<string, 'UserId'>
type DeviceId = Brand<string, 'DeviceId'>

export const createUserId = (id: string): UserId => id as UserId
export const createDeviceId = (id: string): DeviceId => id as DeviceId

export const getUserById = (id: UserId): Promise<User | null> => {
  // Implementation - can only be called with UserId
}

export const getDeviceById = (id: DeviceId): Promise<Device | null> => {
  // Implementation - can only be called with DeviceId
}

// Usage
const userId = createUserId('user123')
const deviceId = createDeviceId('device456')

getUserById(userId) // ✅ Correct
getUserById(deviceId) // ❌ Type error - prevents mixing up IDs
```

### 3. Conditional Types and Mapped Types

```typescript
// ✅ CORRECT - Advanced type utilities
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// API response type with strict validation
type ApiResponse<T> =
  | {
      success: true
      data: T
      timestamp: string
    }
  | {
      success: false
      error: string
      code: number
      timestamp: string
    }

export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (response.success) {
    return response.data // TypeScript knows data exists
  } else {
    throw new Error(`API Error ${response.code}: ${response.error}`)
  }
}
```

## Compilation and Enforcement

### Build Scripts with Type Checking

```json
{
  "scripts": {
    "type:check": "tsc --noEmit",
    "type:watch": "tsc --noEmit --watch",
    "build:check": "tsc && npm run lint",
    "prebuild": "npm run type:check",
    "pretest": "npm run type:check"
  }
}
```

### Git Hooks for Type Safety

```bash
#!/bin/sh
# .husky/pre-commit
echo "Running TypeScript type checking..."
npm run type:check

if [ $? -ne 0 ]; then
  echo "❌ TypeScript type checking failed. Commit aborted."
  exit 1
fi

echo "✅ TypeScript type checking passed."
```

### CI/CD Integration

```yaml
# .github/workflows/quality.yml
name: Type Safety Check
on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type:check
      - run: npm run build:check
```

## Common Strict Mode Violations and Fixes

### 1. Index Signature Issues

```typescript
// ❌ Problem
const config: Record<string, string> = {}
const value = config.someKey.toUpperCase() // Error: possibly undefined

// ✅ Solution
const value = config.someKey?.toUpperCase() ?? 'DEFAULT'
// or
const value = config.someKey ? config.someKey.toUpperCase() : 'DEFAULT'
```

### 2. Array Access Issues

```typescript
// ❌ Problem
const users: User[] = []
const firstUser = users[0].username // Error: possibly undefined

// ✅ Solution
const firstUser = users[0]?.username ?? 'No user'
// or
const firstUser = users.length > 0 ? users[0].username : 'No user'
```

### 3. Function Parameter Issues

```typescript
// ❌ Problem
export const processUser = (user) => {
  // Error: implicit any
  return user.username
}

// ✅ Solution
export const processUser = (user: User): string => {
  return user.username
}
```

This configuration ensures 100% TypeScript strict mode compliance across both projects, preventing runtime errors and improving code reliability.
