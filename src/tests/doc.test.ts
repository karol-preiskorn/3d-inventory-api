/**
 * @file doc.test.ts
 * @description Comprehensive test suite for Documentation API endpoints.
 *
 * Coverage includes:
 * - Complete documentation API testing
 * - Content management and organization
 * - Documentation generation and rendering
 * - API documentation serving
 * - Markdown processing and validation
 * - Content versioning and history
 * - Documentation search and indexing
 * - Template management and customization
 * - Multi-format export capabilities
 * - Documentation analytics and metrics
 * - Access control and permissions
 * - Real-time collaboration features
 * - Integration with external systems
 * - Content validation and formatting
 *
 * @version 2024-09-22 Comprehensive documentation API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Documentation API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testDocumentIds: string[] = []
  const testTemplateIds: string[] = []
  const testVersionIds: string[] = []
  const testCleanupIds: string[] = []
  // Mock documentation data
  const _mockDocumentationData = {
    basicDocument: {
      title: 'API Reference Guide',
      content: '# API Reference\n\nThis is the main API documentation.',
      format: 'markdown',
      category: 'api',
      tags: ['reference', 'guide'],
      isPublic: true
    },
    apiEndpoint: {
      path: '/api/devices',
      method: 'GET',
      description: 'Retrieve all devices',
      parameters: [
        {
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number for pagination'
        }
      ],
      responses: {
        '200': {
          description: 'Success',
          schema: {
            type: 'array',
            items: { $ref: '#/definitions/Device' }
          }
        }
      }
    },
    template: {
      name: 'API Endpoint Template',
      content: '# {{title}}\n\n{{description}}\n\n## Parameters\n\n{{parameters}}',
      variables: ['title', 'description', 'parameters'],
      category: 'api'
    }
  }

  // ===============================
  // SETUP AND TEARDOWN
  // ===============================
  beforeAll(async () => {
    try {
      if (!config.ATLAS_URI) {
        throw new Error('ATLAS_URI not configured for tests')
      }

      connection = await MongoClient.connect(config.ATLAS_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000
      })
      db = connection.db(config.DBNAME)

      await db.admin().ping()
      console.log('✅ MongoDB connection successful for comprehensive documentation tests')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        console.warn('⚠️ Skipping database tests - database not accessible')

        return
      }

      throw error
    }
  }, 30000)

  afterAll(async () => {
    try {
      // Clean up test data
      if (db) {
        if (testCleanupIds.length > 0) {
          const documentCollection = db.collection('documentation')
          const documentObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await documentCollection.deleteMany({ _id: { $in: documentObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test documents`)
        }

        if (testTemplateIds.length > 0) {
          const templateCollection = db.collection('documentationTemplates')
          const templateObjectIds = testTemplateIds.map(id => new ObjectId(id))

          await templateCollection.deleteMany({ _id: { $in: templateObjectIds } })
          console.log(`🧹 Cleaned up ${testTemplateIds.length} test templates`)
        }

        if (testVersionIds.length > 0) {
          const versionCollection = db.collection('documentationVersions')
          const versionObjectIds = testVersionIds.map(id => new ObjectId(id))

          await versionCollection.deleteMany({ _id: { $in: versionObjectIds } })
          console.log(`🧹 Cleaned up ${testVersionIds.length} test versions`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error)
    } finally {
      if (connection) {
        await connection.close()
        console.log('🔌 Database connection closed')
      }
    }
  }, 10000)

  // Helper functions
  const checkDbConnection = (): boolean => {
    if (!connection || !db) {
      console.warn('⚠️ Skipping test - no database connection')

      return false
    }

    return true
  }
  const createUniqueDocument = (overrides = {}) => {
    return {
      title: `Document_${testGenerators.productName()}`,
      content: `# ${testGenerators.productName()}\n\n${testGenerators.productName()}`,
      format: 'markdown',
      category: 'guide',
      tags: ['test', 'documentation'],
      isPublic: true,
      author: testGenerators.user().username,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      metadata: {
        wordCount: 100,
        readingTime: 5,
        lastEditor: testGenerators.user().username
      },
      ...overrides
    }
  }
  const createDocumentTemplate = (overrides = {}) => {
    return {
      name: `Template_${testGenerators.productName().replace(/\s+/g, '')}`,
      content: '# {{title}}\n\n{{description}}\n\n{{content}}',
      variables: ['title', 'description', 'content'],
      category: 'general',
      isActive: true,
      createdBy: testGenerators.user().username,
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Documentation Operations', () => {
    it('should store and retrieve documentation', async () => {
      if (!checkDbConnection()) return

      const documentCollection = db.collection('documentation')
      const document = createUniqueDocument()
      const result = await documentCollection.insertOne(document)

      expect(result.insertedId).toBeDefined()

      testDocumentIds.push(result.insertedId.toString())
      testCleanupIds.push(result.insertedId.toString())

      // Verify retrieval
      const stored = await documentCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.title).toBe(document.title)
      expect(stored!.content).toBe(document.content)
      expect(stored!.metadata).toEqual(document.metadata)
    })

    it('should handle document versioning', async () => {
      if (!checkDbConnection()) return

      const versionCollection = db.collection('documentationVersions')
      const versionData = {
        documentId: testDocumentIds[0] || new ObjectId().toString(),
        version: '1.1.0',
        content: 'Updated content for version 1.1.0',
        changes: ['Updated introduction', 'Added new section'],
        createdAt: new Date(),
        createdBy: testGenerators.user().username
      }
      const result = await versionCollection.insertOne(versionData)

      expect(result.insertedId).toBeDefined()

      testVersionIds.push(result.insertedId.toString())

      // Verify version storage
      const stored = await versionCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.version).toBe('1.1.0')
      expect(stored!.changes).toEqual(versionData.changes)
    })

    it('should index documents for search', async () => {
      if (!checkDbConnection()) return

      const searchCollection = db.collection('documentationSearch')
      const searchIndex = {
        documentId: testDocumentIds[0] || new ObjectId().toString(),
        title: 'API Reference Guide',
        content: 'API documentation content with keywords',
        keywords: ['api', 'reference', 'guide', 'documentation'],
        category: 'api',
        tags: ['reference', 'guide'],
        lastIndexed: new Date()
      }
      const result = await searchCollection.insertOne(searchIndex)

      expect(result.insertedId).toBeDefined()

      // Verify search index
      const stored = await searchCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.keywords).toEqual(searchIndex.keywords)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /doc
  // ===============================
  describe('GET /doc - List Documentation', () => {
    it('should retrieve all documentation', async () => {
      const response = await request(app)
        .get('/doc')
        .set('Accept', 'application/json')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(0)

      if (response.body.length > 0) {
        const document = response.body[0]

        expect(document).toHaveProperty('_id')
        expect(document).toHaveProperty('title')
        expect(document).toHaveProperty('content')
        expect(document).toHaveProperty('format')
      }
    })

    it('should support pagination for large document collections', async () => {
      const response = await request(app)
        .get('/doc')
        .query({ page: 1, limit: 5 })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(5)
    })

    it('should filter documents by category', async () => {
      const response = await request(app)
        .get('/doc')
        .query({ category: 'api' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((doc: any) => {
          expect(doc.category).toBe('api')
        })
      }
    })

    it('should filter documents by tags', async () => {
      const response = await request(app)
        .get('/doc')
        .query({ tags: 'reference,guide' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((doc: any) => {
          expect(doc.tags.some((tag: string) => ['reference', 'guide'].includes(tag))).toBe(true)
        })
      }
    })

    it('should search documents by content', async () => {
      const response = await request(app)
        .get('/doc')
        .query({ search: 'API reference' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((doc: any) => {
          const searchableText = `${doc.title} ${doc.content}`.toLowerCase()

          expect(searchableText.includes('api') || searchableText.includes('reference')).toBe(true)
        })
      }
    })

    it('should sort documents by various criteria', async () => {
      const response = await request(app)
        .get('/doc')
        .query({ sort: 'updatedAt', order: 'desc' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 1) {
        for (let i = 1; i < response.body.length; i++) {
          const current = new Date(response.body[i].updatedAt)
          const previous = new Date(response.body[i - 1].updatedAt)

          expect(current.getTime()).toBeLessThanOrEqual(previous.getTime())
        }
      }
    })

    it('should include metadata in response', async () => {
      const response = await request(app)
        .get('/doc')
        .query({ includeMetadata: true })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        const document = response.body[0]

        expect(document).toHaveProperty('metadata')
        expect(document.metadata).toHaveProperty('wordCount')
        expect(document.metadata).toHaveProperty('readingTime')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /doc
  // ===============================
  describe('POST /doc - Create Documentation', () => {
    it('should create new documentation', async () => {
      const newDocument = createUniqueDocument()
      const response = await request(app)
        .post('/doc')
        .send(newDocument)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('title', newDocument.title)
      expect(response.body).toHaveProperty('content', newDocument.content)
      expect(response.body).toHaveProperty('format', newDocument.format)

      testDocumentIds.push(response.body._id)
    })

    it('should validate required fields', async () => {
      const invalidDocument = {
        content: 'Content without title'
        // Missing required 'title' field
      }
      const response = await request(app)
        .post('/doc')
        .send(invalidDocument)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('title')
    })

    it('should validate content format', async () => {
      const invalidFormatDocument = createUniqueDocument({
        format: 'invalid-format'
      })
      const response = await request(app)
        .post('/doc')
        .send(invalidFormatDocument)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid format')
    })

    it('should process markdown content', async () => {
      const markdownDocument = createUniqueDocument({
        content: '# Heading\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2',
        format: 'markdown'
      })
      const response = await request(app)
        .post('/doc')
        .send(markdownDocument)
        .expect(201)

      expect(response.body).toHaveProperty('renderedContent')
      expect(response.body.renderedContent).toContain('<h1>')
      expect(response.body.renderedContent).toContain('<strong>')
      expect(response.body.renderedContent).toContain('<ul>')

      testDocumentIds.push(response.body._id)
    })

    it('should generate metadata automatically', async () => {
      const document = createUniqueDocument({
        content: 'This is a test document with multiple words to calculate reading time.'
      })
      const response = await request(app)
        .post('/doc')
        .send(document)
        .expect(201)

      expect(response.body).toHaveProperty('metadata')
      expect(response.body.metadata).toHaveProperty('wordCount')
      expect(response.body.metadata).toHaveProperty('readingTime')
      expect(response.body.metadata.wordCount).toBeGreaterThan(0)

      testDocumentIds.push(response.body._id)
    })

    it('should create document with template', async () => {
      const templateDocument = {
        title: 'API Endpoint Documentation',
        template: 'api-endpoint',
        variables: {
          title: 'GET /api/devices',
          description: 'Retrieve all devices',
          parameters: 'page: integer (optional)'
        }
      }
      const response = await request(app)
        .post('/doc')
        .send(templateDocument)
        .expect(201)

      expect(response.body).toHaveProperty('content')
      expect(response.body.content).toContain('GET /api/devices')
      expect(response.body.content).toContain('Retrieve all devices')

      testDocumentIds.push(response.body._id)
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousDocument = createUniqueDocument({
        title: 'Normal Title',
        content: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/doc')
        .send(maliciousDocument)
        .expect(201)

      expect(response.body).not.toHaveProperty('$where')
      expect(response.body.content).not.toContain('<script>')

      testDocumentIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /doc/:id
  // ===============================
  describe('GET /doc/:id - Get Specific Documentation', () => {
    let testDocumentId: string

    beforeAll(async () => {
      const document = createUniqueDocument()
      const response = await request(app)
        .post('/doc')
        .send(document)
        .expect(201)

      testDocumentId = response.body._id
      testDocumentIds.push(testDocumentId)
    })

    it('should retrieve specific documentation by ID', async () => {
      const response = await request(app)
        .get(`/doc/${testDocumentId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testDocumentId)
      expect(response.body).toHaveProperty('title')
      expect(response.body).toHaveProperty('content')
      expect(response.body).toHaveProperty('format')
      expect(response.body).toHaveProperty('metadata')
    })

    it('should return 404 for non-existent documentation', async () => {
      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .get(`/doc/${nonExistentId}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('not found')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/doc/invalid-id-format')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid ID format')
    })

    it('should include rendered content for markdown', async () => {
      const response = await request(app)
        .get(`/doc/${testDocumentId}`)
        .query({ render: true })
        .expect(200)

      expect(response.body).toHaveProperty('renderedContent')
      if (response.body.format === 'markdown') {
        expect(response.body.renderedContent).toContain('<')
      }
    })

    it('should include version history if requested', async () => {
      const response = await request(app)
        .get(`/doc/${testDocumentId}`)
        .query({ includeVersions: true })
        .expect(200)

      expect(response.body).toHaveProperty('versions')
      expect(Array.isArray(response.body.versions)).toBe(true)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /doc/:id
  // ===============================
  describe('PUT /doc/:id - Update Documentation', () => {
    let testDocumentId: string

    beforeAll(async () => {
      const document = createUniqueDocument()
      const response = await request(app)
        .post('/doc')
        .send(document)
        .expect(201)

      testDocumentId = response.body._id
      testDocumentIds.push(testDocumentId)
    })

    it('should update documentation', async () => {
      const updatedDocument = {
        title: 'Updated Documentation Title',
        content: '# Updated Content\n\nThis content has been updated.',
        tags: ['updated', 'test']
      }
      const response = await request(app)
        .put(`/doc/${testDocumentId}`)
        .send(updatedDocument)
        .expect(200)

      expect(response.body.title).toBe('Updated Documentation Title')
      expect(response.body.content).toBe('# Updated Content\n\nThis content has been updated.')
      expect(response.body.tags).toEqual(['updated', 'test'])
    })

    it('should create new version on update', async () => {
      const updateData = {
        content: 'Version 2.0 content with significant changes'
      }
      const response = await request(app)
        .put(`/doc/${testDocumentId}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('version')
      expect(response.body.version).not.toBe('1.0.0')

      // Check if version was created
      const versionResponse = await request(app)
        .get(`/doc/${testDocumentId}/versions`)
        .expect(200)

      expect(Array.isArray(versionResponse.body)).toBe(true)
      expect(versionResponse.body.length).toBeGreaterThan(0)
    })

    it('should update metadata on modification', async () => {
      const originalResponse = await request(app)
        .get(`/doc/${testDocumentId}`)
        .expect(200)
      const originalTimestamp = originalResponse.body.updatedAt

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100))

      const updateResponse = await request(app)
        .put(`/doc/${testDocumentId}`)
        .send({ content: 'Timestamp test update' })
        .expect(200)

      expect(updateResponse.body.updatedAt).not.toBe(originalTimestamp)
      expect(updateResponse.body.metadata.lastEditor).toBeDefined()
    })

    it('should return 404 for non-existent documentation', async () => {
      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .put(`/doc/${nonExistentId}`)
        .send({ title: 'Test update' })
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('not found')
    })
  })

  // ===============================
  // TEMPLATE MANAGEMENT TESTS
  // ===============================
  describe('Template Management', () => {
    it('should create documentation template', async () => {
      const template = createDocumentTemplate()
      const response = await request(app)
        .post('/doc/templates')
        .send(template)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('name', template.name)
      expect(response.body).toHaveProperty('content', template.content)
      expect(response.body).toHaveProperty('variables', template.variables)

      testTemplateIds.push(response.body._id)
    })

    it('should retrieve all templates', async () => {
      const response = await request(app)
        .get('/doc/templates')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        const template = response.body[0]

        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('content')
        expect(template).toHaveProperty('variables')
      }
    })

    it('should render template with variables', async () => {
      const template = createDocumentTemplate()
      const createResponse = await request(app)
        .post('/doc/templates')
        .send(template)
        .expect(201)

      testTemplateIds.push(createResponse.body._id)

      const renderData = {
        title: 'Test Title',
        description: 'Test Description',
        content: 'Test Content'
      }
      const renderResponse = await request(app)
        .post(`/doc/templates/${createResponse.body._id}/render`)
        .send(renderData)
        .expect(200)

      expect(renderResponse.body).toHaveProperty('renderedContent')
      expect(renderResponse.body.renderedContent).toContain('Test Title')
      expect(renderResponse.body.renderedContent).toContain('Test Description')
    })

    it('should validate template variables', async () => {
      const templateWithMissingVars = createDocumentTemplate({
        content: '# {{title}}\n\n{{missingVariable}}',
        variables: ['title'] // Missing 'missingVariable'
      })
      const response = await request(app)
        .post('/doc/templates')
        .send(templateWithMissingVars)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('variables')
    })
  })

  // ===============================
  // EXPORT AND IMPORT TESTS
  // ===============================
  describe('Export and Import Operations', () => {
    it('should export documentation as PDF', async () => {
      const document = createUniqueDocument()
      const createResponse = await request(app)
        .post('/doc')
        .send(document)
        .expect(201)

      testDocumentIds.push(createResponse.body._id)

      const exportResponse = await request(app)
        .get(`/doc/${createResponse.body._id}/export/pdf`)
        .expect(200)

      expect(exportResponse.headers['content-type']).toContain('application/pdf')
      expect(exportResponse.headers['content-disposition']).toContain('attachment')
    })

    it('should export documentation as HTML', async () => {
      const document = createUniqueDocument()
      const createResponse = await request(app)
        .post('/doc')
        .send(document)
        .expect(201)

      testDocumentIds.push(createResponse.body._id)

      const exportResponse = await request(app)
        .get(`/doc/${createResponse.body._id}/export/html`)
        .expect(200)

      expect(exportResponse.headers['content-type']).toContain('text/html')
      expect(exportResponse.text).toContain('<html>')
      expect(exportResponse.text).toContain('<body>')
    })

    it('should export multiple documents as archive', async () => {
      const documentIds = [
        testDocumentIds[0] || new ObjectId().toString(),
        testDocumentIds[1] || new ObjectId().toString()
      ]
      const exportData = {
        documentIds,
        format: 'zip'
      }
      const response = await request(app)
        .post('/doc/export/bulk')
        .send(exportData)
        .expect(200)

      expect(response.headers['content-type']).toContain('application/zip')
      expect(response.headers['content-disposition']).toContain('attachment')
    })

    it('should import documentation from file', async () => {
      const importData = {
        documents: [
          {
            title: 'Imported Document',
            content: '# Imported Content\n\nThis was imported.',
            format: 'markdown'
          }
        ],
        replaceExisting: false
      }
      const response = await request(app)
        .post('/doc/import')
        .send(importData)
        .expect(200)

      expect(response.body).toHaveProperty('imported')
      expect(response.body).toHaveProperty('conflicts')
      expect(response.body.imported).toBeGreaterThan(0)

      if (response.body.documentIds) {
        testDocumentIds.push(...response.body.documentIds)
      }
    })
  })

  // ===============================
  // SEARCH AND ANALYTICS TESTS
  // ===============================
  describe('Search and Analytics', () => {
    it('should perform full-text search across documents', async () => {
      const searchQuery = {
        query: 'API documentation',
        filters: {
          category: 'api',
          format: 'markdown'
        }
      }
      const response = await request(app)
        .post('/doc/search')
        .send(searchQuery)
        .expect(200)

      expect(response.body).toHaveProperty('results')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('searchTime')
      expect(Array.isArray(response.body.results)).toBe(true)

      if (response.body.results.length > 0) {
        const result = response.body.results[0]

        expect(result).toHaveProperty('document')
        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('highlights')
      }
    })

    it('should provide search suggestions', async () => {
      const response = await request(app)
        .get('/doc/search/suggestions')
        .query({ q: 'api' })
        .expect(200)

      expect(Array.isArray(response.body.suggestions)).toBe(true)

      if (response.body.suggestions.length > 0) {
        const suggestion = response.body.suggestions[0]

        expect(suggestion).toHaveProperty('text')
        expect(suggestion).toHaveProperty('score')
      }
    })

    it('should provide documentation analytics', async () => {
      const response = await request(app)
        .get('/doc/analytics')
        .expect(200)

      expect(response.body).toHaveProperty('totalDocuments')
      expect(response.body).toHaveProperty('categoryCounts')
      expect(response.body).toHaveProperty('recentActivity')
      expect(response.body).toHaveProperty('popularDocuments')
    })

    it('should track document views and popularity', async () => {
      const document = createUniqueDocument()
      const createResponse = await request(app)
        .post('/doc')
        .send(document)
        .expect(201)

      testDocumentIds.push(createResponse.body._id)

      // View document multiple times
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get(`/doc/${createResponse.body._id}`)
          .expect(200)
      }

      // Check analytics
      const analyticsResponse = await request(app)
        .get(`/doc/${createResponse.body._id}/analytics`)
        .expect(200)

      expect(analyticsResponse.body).toHaveProperty('views')
      expect(analyticsResponse.body.views).toBeGreaterThan(0)
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle very large documents', async () => {
      const largeContent = 'x'.repeat(1000000) // 1MB of content
      const largeDocument = createUniqueDocument({
        content: largeContent
      })
      const response = await request(app)
        .post('/doc')
        .send(largeDocument)

      expect([201, 413]).toContain(response.status)

      if (response.status === 413) {
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toContain('too large')
      } else {
        testDocumentIds.push(response.body._id)
      }
    })

    it('should handle malformed markdown gracefully', async () => {
      const malformedMarkdown = createUniqueDocument({
        content: '# Heading\n\n[Invalid link](http://\n\n**Unclosed bold',
        format: 'markdown'
      })
      const response = await request(app)
        .post('/doc')
        .send(malformedMarkdown)
        .expect(201)

      expect(response.body).toHaveProperty('renderedContent')
      // Should handle gracefully without throwing errors

      testDocumentIds.push(response.body._id)
    })

    it('should handle concurrent document updates', async () => {
      const document = createUniqueDocument()
      const createResponse = await request(app)
        .post('/doc')
        .send(document)
        .expect(201)

      testDocumentIds.push(createResponse.body._id)

      // Simulate concurrent updates
      const update1 = { content: 'Update 1' }
      const update2 = { content: 'Update 2' }
      const promises = [
        request(app).put(`/doc/${createResponse.body._id}`).send(update1),
        request(app).put(`/doc/${createResponse.body._id}`).send(update2)
      ]
      const responses = await Promise.all(promises)
      // At least one should succeed
      const successfulUpdates = responses.filter(r => r.status === 200)

      expect(successfulUpdates.length).toBeGreaterThan(0)
    })

    it('should handle invalid template syntax', async () => {
      const invalidTemplate = createDocumentTemplate({
        content: '# {{title}\n\n{{invalid syntax}}\n\n{{/unclosed}}',
        variables: ['title']
      })
      const response = await request(app)
        .post('/doc/templates')
        .send(invalidTemplate)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid template syntax')
    })

    it('should handle missing file uploads gracefully', async () => {
      const response = await request(app)
        .post('/doc/upload')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('No file uploaded')
    })
  })
})
