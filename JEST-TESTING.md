# Jest Testing Best Practices

## Replaced @faker-js/faker with Better Alternatives

### Why Replace Faker.js?



1. **Bundle Size**: @faker-js/faker is quite large (~2.5MB)


2. **Jest Compatibility**: Can have module resolution issues with Jest


3. **Performance**: Casual is lighter and faster for simple test data


4. **Simplicity**: Cleaner API for basic test data generation

### New Testing Stack

#### 1. Casual for Test Data Generation

```bash
npm install --save-dev casual
```

**Benefits:**



- Lightweight (~100KB vs 2.5MB)


- Better Jest compatibility


- Deterministic with seeding


- Simple API


- No TypeScript issues

**Usage:**

```typescript

import casual from 'casual'

// Configure for consistent test data
casual.seed(12345)

// Generate test data
const generators = {
  floorName: () => casual.first_name + ' ' + casual.word,
  address: () => ({
    street: casual.street,
    city: casual.city,
    country: casual.country,
    postcode: casual.integer(10000, 99999),
  }),
}
```

#### 2. Jest Mock Extended (Optional)

```bash
npm install --save-dev jest-mock-extended
```

**Benefits:**



- Type-safe mocking


- Better TypeScript integration


- Advanced mock features

### Migration from Faker.js

**Before (Faker.js):**

```typescript

import { faker } from '@faker-js/faker'

const mockData = {
  name: faker.name.fullName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 65 }),
}
```

**After (Casual):**

```typescript

import casual from 'casual'

casual.seed(12345) // For deterministic tests

const mockData = {
  name: casual.full_name,
  email: casual.email,
  age: casual.integer(18, 65),
}
```

### Test Data Generators Pattern

Create reusable generators for consistent test data:

```typescript
const generators = {
  user: () => ({
    name: casual.full_name,
    email: casual.email,
    age: casual.integer(18, 65),
  }),

  address: () => ({
    street: casual.street,
    city: casual.city,
    country: casual.country,
    postcode: casual.integer(10000, 99999),
  }),
}

// Usage in tests
const testUser = generators.user()
const testAddress = generators.address()
```

### Performance Comparison

| Package                     | Size   | Jest Compatible | TypeScript  | Deterministic |



| --------------------------- | ------ | --------------- | ----------- | ------------- |



| @faker-js/faker             | ~2.5MB | ⚠️ Issues       | ✅ Yes      | ✅ Yes        |



| casual                      | ~100KB | ✅ Yes          | ⚠️ No types | ✅ Yes        |



| @jackfranklin/test-data-bot | ~50KB  | ✅ Yes          | ✅ Yes      | ✅ Yes        |



### Best Practices



1. **Seed your generators** for deterministic tests:

   ```typescript
   casual.seed(12345)
   ```



2. **Create generator functions** for reusable test data:

   ```typescript
   const createTestFloor = () => ({
     name: generators.floorName(),
     address: generators.address(),
     dimension: [generators.dimension()],
   })
   ```



3. **Keep test data simple** - only generate what you need for the test



4. **Use const for mock data** unless you need to reassign

### Additional Alternatives

If you need more features, consider:



- **@jackfranklin/test-data-bot**: More structured approach


- **fishery**: Factory pattern for test data


- **rosie**: Ruby-inspired factories for JavaScript

### Migration Checklist



- [x] Remove @faker-js/faker dependency


- [x] Install casual


- [x] Update test files to use casual


- [x] Fix ESLint errors


- [x] Verify tests still pass


- [x] Update documentation

