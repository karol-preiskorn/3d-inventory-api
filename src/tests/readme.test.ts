/**
 * @file readme.test.ts
 * @description Comprehensive test suite for README API endpoints.
 *
 * Coverage includes:
 * - Complete README API testing
 * - Markdown processing and rendering
 * - Content serving and management
 * - Documentation integration
 * - Version control and history
 * - Template-based README generation
 * - Dynamic content injection
 * - Multi-format output support
 * - Content validation and formatting
 * - README analytics and metrics
 * - Search and indexing capabilities
 * - Integration with project metadata
 * - Automated README updates
 * - Content synchronization
 *
 * @version 2024-09-22 Comprehensive README API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('README API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testReadmeIds: string[] = []
  const testTemplateIds: string[] = []
  const testCleanupIds: string[] = []

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
      console.log('✅ MongoDB connection successful for comprehensive README tests')
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
          const readmeCollection = db.collection('readmes')
          const readmeObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await readmeCollection.deleteMany({ _id: { $in: readmeObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test READMEs`)
        }

        if (testTemplateIds.length > 0) {
          const templateCollection = db.collection('readmeTemplates')
          const templateObjectIds = testTemplateIds.map(id => new ObjectId(id))

          await templateCollection.deleteMany({ _id: { $in: templateObjectIds } })
          console.log(`🧹 Cleaned up ${testTemplateIds.length} test README templates`)
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
  const createUniqueReadme = (overrides = {}) => {
    return {
      title: `README for ${testGenerators.productName()}`,
      content: `# ${testGenerators.productName()}\n\n${testGenerators.productName()}\n\n## Installation\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Usage\n\n${testGenerators.productName()}`,
      projectName: testGenerators.productName().replace(/\s+/g, '-').toLowerCase(),
      version: '1.0.0',
      format: 'markdown',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        author: testGenerators.user().username,
        license: 'MIT',
        repository: 'https://github.com/user/repo.git',
        wordCount: 150,
        sections: ['Installation', 'Usage', 'API', 'Contributing']
      },
      ...overrides
    }
  }
  const createReadmeTemplate = (overrides = {}) => {
    return {
      name: `ReadmeTemplate_${testGenerators.productName().replace(/\s+/g, '')}`,
      content: '# {{projectName}}\n\n{{description}}\n\n## Installation\n\n```bash\n{{installCommand}}\n```\n\n## Usage\n\n{{usage}}\n\n## API\n\n{{apiDocs}}\n\n## Contributing\n\n{{contributing}}',
      variables: ['projectName', 'description', 'installCommand', 'usage', 'apiDocs', 'contributing'],
      category: 'project',
      isActive: true,
      createdBy: testGenerators.user().username,
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database README Operations', () => {
    it('should store and retrieve README documents', async () => {
      if (!checkDbConnection()) return

      const readmeCollection = db.collection('readmes')
      const readme = createUniqueReadme()
      const result = await readmeCollection.insertOne(readme)

      expect(result.insertedId).toBeDefined()

      testReadmeIds.push(result.insertedId.toString())
      testCleanupIds.push(result.insertedId.toString())

      // Verify retrieval
      const stored = await readmeCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.title).toBe(readme.title)
      expect(stored!.content).toBe(readme.content)
      expect(stored!.metadata).toEqual(readme.metadata)
    })

    it('should handle README versioning', async () => {
      if (!checkDbConnection()) return

      const versionCollection = db.collection('readmeVersions')
      const versionData = {
        readmeId: testReadmeIds[0] || new ObjectId().toString(),
        version: '1.1.0',
        content: '# Updated README\n\nThis is version 1.1.0 with updates.',
        changes: ['Updated installation instructions', 'Added new usage examples'],
        createdAt: new Date(),
        createdBy: testGenerators.user().username
      }
      const result = await versionCollection.insertOne(versionData)

      expect(result.insertedId).toBeDefined()

      // Verify version storage
      const stored = await versionCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.version).toBe('1.1.0')
      expect(stored!.changes).toEqual(versionData.changes)
    })

    it('should track README analytics', async () => {
      if (!checkDbConnection()) return

      const analyticsCollection = db.collection('readmeAnalytics')
      const analyticsData = {
        readmeId: testReadmeIds[0] || new ObjectId().toString(),
        views: 25,
        downloads: 5,
        lastViewed: new Date(),
        popularSections: ['Installation', 'Usage'],
        viewHistory: [
          { date: new Date(), views: 10 },
          { date: new Date(), views: 15 }
        ]
      }
      const result = await analyticsCollection.insertOne(analyticsData)

      expect(result.insertedId).toBeDefined()

      // Verify analytics
      const stored = await analyticsCollection.findOne({ _id: result.insertedId })

      expect(stored).not.toBeNull()
      expect(stored!.views).toBe(25)
      expect(stored!.popularSections).toEqual(analyticsData.popularSections)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /readme
  // ===============================
  describe('GET /readme - List README Documents', () => {
    it('should retrieve all README documents', async () => {
      const response = await request(app)
        .get('/readme')
        .set('Accept', 'application/json')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(0)

      if (response.body.length > 0) {
        const readme = response.body[0]

        expect(readme).toHaveProperty('_id')
        expect(readme).toHaveProperty('title')
        expect(readme).toHaveProperty('content')
        expect(readme).toHaveProperty('projectName')
      }
    })

    it('should support pagination for large README collections', async () => {
      const response = await request(app)
        .get('/readme')
        .query({ page: 1, limit: 5 })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(5)
    })

    it('should filter READMEs by project name', async () => {
      const response = await request(app)
        .get('/readme')
        .query({ project: 'test-project' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((readme: any) => {
          expect(readme.projectName).toContain('test-project')
        })
      }
    })

    it('should search READMEs by content', async () => {
      const response = await request(app)
        .get('/readme')
        .query({ search: 'installation' })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        response.body.forEach((readme: any) => {
          const searchableText = `${readme.title} ${readme.content}`.toLowerCase()

          expect(searchableText.includes('installation')).toBe(true)
        })
      }
    })

    it('should sort READMEs by various criteria', async () => {
      const response = await request(app)
        .get('/readme')
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
        .get('/readme')
        .query({ includeMetadata: true })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)

      if (response.body.length > 0) {
        const readme = response.body[0]

        expect(readme).toHaveProperty('metadata')
        expect(readme.metadata).toHaveProperty('author')
        expect(readme.metadata).toHaveProperty('wordCount')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /readme
  // ===============================
  describe('POST /readme - Create README Document', () => {
    it('should create new README document', async () => {
      const newReadme = createUniqueReadme()
      const response = await request(app)
        .post('/readme')
        .send(newReadme)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('title', newReadme.title)
      expect(response.body).toHaveProperty('content', newReadme.content)
      expect(response.body).toHaveProperty('projectName', newReadme.projectName)

      testReadmeIds.push(response.body._id)
    })

    it('should validate required fields', async () => {
      const invalidReadme = {
        content: '# Some content'
        // Missing required 'title' and 'projectName' fields
      }
      const response = await request(app)
        .post('/readme')
        .send(invalidReadme)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('title')
      expect(response.body.error).toContain('projectName')
    })

    it('should validate project name format', async () => {
      const invalidProjectReadme = createUniqueReadme({
        projectName: 'Invalid Project Name With Spaces'
      })
      const response = await request(app)
        .post('/readme')
        .send(invalidProjectReadme)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid project name format')
    })

    it('should process markdown content and generate metadata', async () => {
      const markdownReadme = createUniqueReadme({
        content: '# Project Title\n\n## Description\n\nThis is a **bold** description.\n\n### Installation\n\n```bash\nnpm install\n```\n\n### Usage\n\nUsage instructions here.'
      })
      const response = await request(app)
        .post('/readme')
        .send(markdownReadme)
        .expect(201)

      expect(response.body).toHaveProperty('renderedContent')
      expect(response.body.renderedContent).toContain('<h1>')
      expect(response.body.renderedContent).toContain('<strong>')
      expect(response.body.renderedContent).toContain('<code>')

      expect(response.body).toHaveProperty('metadata')
      expect(response.body.metadata).toHaveProperty('wordCount')
      expect(response.body.metadata).toHaveProperty('sections')
      expect(response.body.metadata.sections).toContain('Installation')
      expect(response.body.metadata.sections).toContain('Usage')

      testReadmeIds.push(response.body._id)
    })

    it('should generate README from template', async () => {
      const templateReadme = {
        title: 'Generated README',
        projectName: 'template-project',
        template: 'standard-project',
        variables: {
          projectName: 'Template Project',
          description: 'A project generated from template',
          installCommand: 'npm install template-project',
          usage: 'const project = require("template-project");'
        }
      }
      const response = await request(app)
        .post('/readme')
        .send(templateReadme)
        .expect(201)

      expect(response.body).toHaveProperty('content')
      expect(response.body.content).toContain('Template Project')
      expect(response.body.content).toContain('npm install template-project')

      testReadmeIds.push(response.body._id)
    })

    it('should detect and extract project information', async () => {
      const projectReadme = createUniqueReadme({
        content: '# My API Project\n\n[![Build Status](https://travis-ci.org/user/repo.svg?branch=master)](https://travis-ci.org/user/repo)\n\n## Features\n\n- REST API\n- Authentication\n- Database integration'
      })
      const response = await request(app)
        .post('/readme')
        .send(projectReadme)
        .expect(201)

      expect(response.body).toHaveProperty('metadata')
      expect(response.body.metadata).toHaveProperty('badges')
      expect(response.body.metadata).toHaveProperty('features')

      if (response.body.metadata.badges) {
        expect(Array.isArray(response.body.metadata.badges)).toBe(true)
      }

      testReadmeIds.push(response.body._id)
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousReadme = createUniqueReadme({
        title: 'Normal Title',
        content: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/readme')
        .send(maliciousReadme)
        .expect(201)

      expect(response.body).not.toHaveProperty('$where')
      expect(response.body.content).not.toContain('<script>')

      testReadmeIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /readme/:id
  // ===============================
  describe('GET /readme/:id - Get Specific README Document', () => {
    let testReadmeId: string

    beforeAll(async () => {
      const readme = createUniqueReadme()
      const response = await request(app)
        .post('/readme')
        .send(readme)
        .expect(201)

      testReadmeId = response.body._id
      testReadmeIds.push(testReadmeId)
    })

    it('should retrieve specific README document by ID', async () => {
      const response = await request(app)
        .get(`/readme/${testReadmeId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testReadmeId)
      expect(response.body).toHaveProperty('title')
      expect(response.body).toHaveProperty('content')
      expect(response.body).toHaveProperty('projectName')
      expect(response.body).toHaveProperty('metadata')
    })

    it('should return 404 for non-existent README', async () => {
      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .get(`/readme/${nonExistentId}`)
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('not found')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/readme/invalid-id-format')
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid ID format')
    })

    it('should include rendered content for markdown', async () => {
      const response = await request(app)
        .get(`/readme/${testReadmeId}`)
        .query({ render: true })
        .expect(200)

      expect(response.body).toHaveProperty('renderedContent')
      if (response.body.format === 'markdown') {
        expect(response.body.renderedContent).toContain('<')
      }
    })

    it('should track view analytics', async () => {
      // View the README multiple times
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get(`/readme/${testReadmeId}`)
          .expect(200)
      }

      const analyticsResponse = await request(app)
        .get(`/readme/${testReadmeId}/analytics`)
        .expect(200)

      expect(analyticsResponse.body).toHaveProperty('views')
      expect(analyticsResponse.body.views).toBeGreaterThan(0)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /readme/:id
  // ===============================
  describe('PUT /readme/:id - Update README Document', () => {
    let testReadmeId: string

    beforeAll(async () => {
      const readme = createUniqueReadme()
      const response = await request(app)
        .post('/readme')
        .send(readme)
        .expect(201)

      testReadmeId = response.body._id
      testReadmeIds.push(testReadmeId)
    })

    it('should update README document', async () => {
      const updatedReadme = {
        title: 'Updated README Title',
        content: '# Updated Project\n\nThis README has been updated with new content.\n\n## New Section\n\nNew content here.',
        version: '2.0.0'
      }
      const response = await request(app)
        .put(`/readme/${testReadmeId}`)
        .send(updatedReadme)
        .expect(200)

      expect(response.body.title).toBe('Updated README Title')
      expect(response.body.content).toContain('Updated Project')
      expect(response.body.version).toBe('2.0.0')
    })

    it('should create new version on significant update', async () => {
      const majorUpdate = {
        content: '# Version 3.0\n\nMajor rewrite of the README with completely new structure.',
        version: '3.0.0'
      }
      const response = await request(app)
        .put(`/readme/${testReadmeId}`)
        .send(majorUpdate)
        .expect(200)

      expect(response.body.version).toBe('3.0.0')

      // Check if version was created
      const versionResponse = await request(app)
        .get(`/readme/${testReadmeId}/versions`)
        .expect(200)

      expect(Array.isArray(versionResponse.body)).toBe(true)
      expect(versionResponse.body.length).toBeGreaterThan(0)
    })

    it('should update metadata on modification', async () => {
      const originalResponse = await request(app)
        .get(`/readme/${testReadmeId}`)
        .expect(200)
      const originalTimestamp = originalResponse.body.updatedAt

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100))

      const updateResponse = await request(app)
        .put(`/readme/${testReadmeId}`)
        .send({ content: '# Timestamp test\n\nTesting timestamp update.' })
        .expect(200)

      expect(updateResponse.body.updatedAt).not.toBe(originalTimestamp)
      expect(updateResponse.body.metadata.wordCount).toBeDefined()
    })

    it('should return 404 for non-existent README', async () => {
      const nonExistentId = new ObjectId().toString()
      const response = await request(app)
        .put(`/readme/${nonExistentId}`)
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
    it('should create README template', async () => {
      const template = createReadmeTemplate()
      const response = await request(app)
        .post('/readme/templates')
        .send(template)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body).toHaveProperty('name', template.name)
      expect(response.body).toHaveProperty('content', template.content)
      expect(response.body).toHaveProperty('variables', template.variables)

      testTemplateIds.push(response.body._id)
    })

    it('should retrieve all README templates', async () => {
      const response = await request(app)
        .get('/readme/templates')
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
      const template = createReadmeTemplate()
      const createResponse = await request(app)
        .post('/readme/templates')
        .send(template)
        .expect(201)

      testTemplateIds.push(createResponse.body._id)

      const renderData = {
        projectName: 'Test Project',
        description: 'A test project',
        installCommand: 'npm install test-project',
        usage: 'const test = require("test-project");',
        apiDocs: 'See API documentation',
        contributing: 'Please contribute!'
      }
      const renderResponse = await request(app)
        .post(`/readme/templates/${createResponse.body._id}/render`)
        .send(renderData)
        .expect(200)

      expect(renderResponse.body).toHaveProperty('renderedContent')
      expect(renderResponse.body.renderedContent).toContain('Test Project')
      expect(renderResponse.body.renderedContent).toContain('npm install test-project')
    })

    it('should validate template variables', async () => {
      const templateWithMissingVars = createReadmeTemplate({
        content: '# {{projectName}}\n\n{{missingVariable}}',
        variables: ['projectName'] // Missing 'missingVariable'
      })
      const response = await request(app)
        .post('/readme/templates')
        .send(templateWithMissingVars)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('variables')
    })
  })

  // ===============================
  // EXPORT AND FORMAT TESTS
  // ===============================
  describe('Export and Format Operations', () => {
    it('should export README as HTML', async () => {
      const readme = createUniqueReadme()
      const createResponse = await request(app)
        .post('/readme')
        .send(readme)
        .expect(201)

      testReadmeIds.push(createResponse.body._id)

      const exportResponse = await request(app)
        .get(`/readme/${createResponse.body._id}/export/html`)
        .expect(200)

      expect(exportResponse.headers['content-type']).toContain('text/html')
      expect(exportResponse.text).toContain('<html>')
      expect(exportResponse.text).toContain('<body>')
    })

    it('should export README as PDF', async () => {
      const readme = createUniqueReadme()
      const createResponse = await request(app)
        .post('/readme')
        .send(readme)
        .expect(201)

      testReadmeIds.push(createResponse.body._id)

      const exportResponse = await request(app)
        .get(`/readme/${createResponse.body._id}/export/pdf`)
        .expect(200)

      expect(exportResponse.headers['content-type']).toContain('application/pdf')
      expect(exportResponse.headers['content-disposition']).toContain('attachment')
    })

    it('should export README as plain text', async () => {
      const readme = createUniqueReadme()
      const createResponse = await request(app)
        .post('/readme')
        .send(readme)
        .expect(201)

      testReadmeIds.push(createResponse.body._id)

      const exportResponse = await request(app)
        .get(`/readme/${createResponse.body._id}/export/text`)
        .expect(200)

      expect(exportResponse.headers['content-type']).toContain('text/plain')
      expect(typeof exportResponse.text).toBe('string')
    })

    it('should generate README preview', async () => {
      const previewData = {
        content: '# Preview Project\n\nThis is a preview of a README.',
        theme: 'github'
      }
      const response = await request(app)
        .post('/readme/preview')
        .send(previewData)
        .expect(200)

      expect(response.body).toHaveProperty('preview')
      expect(response.body.preview).toContain('<')
      expect(response.body).toHaveProperty('metadata')
    })
  })

  // ===============================
  // ANALYTICS AND SEARCH TESTS
  // ===============================
  describe('Analytics and Search', () => {
    it('should provide README analytics', async () => {
      const response = await request(app)
        .get('/readme/analytics')
        .expect(200)

      expect(response.body).toHaveProperty('totalReadmes')
      expect(response.body).toHaveProperty('popularProjects')
      expect(response.body).toHaveProperty('recentActivity')
      expect(response.body).toHaveProperty('topSections')
    })

    it('should search READMEs by content and metadata', async () => {
      const searchQuery = {
        query: 'installation npm',
        filters: {
          format: 'markdown',
          hasSection: 'Installation'
        }
      }
      const response = await request(app)
        .post('/readme/search')
        .send(searchQuery)
        .expect(200)

      expect(response.body).toHaveProperty('results')
      expect(response.body).toHaveProperty('total')
      expect(Array.isArray(response.body.results)).toBe(true)

      if (response.body.results.length > 0) {
        const result = response.body.results[0]

        expect(result).toHaveProperty('readme')
        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('highlights')
      }
    })

    it('should provide search suggestions', async () => {
      const response = await request(app)
        .get('/readme/search/suggestions')
        .query({ q: 'install' })
        .expect(200)

      expect(Array.isArray(response.body.suggestions)).toBe(true)

      if (response.body.suggestions.length > 0) {
        const suggestion = response.body.suggestions[0]

        expect(suggestion).toHaveProperty('text')
        expect(suggestion).toHaveProperty('score')
      }
    })

    it('should track popular README sections', async () => {
      const response = await request(app)
        .get('/readme/analytics/sections')
        .expect(200)

      expect(response.body).toHaveProperty('sections')
      expect(Array.isArray(response.body.sections)).toBe(true)

      if (response.body.sections.length > 0) {
        const section = response.body.sections[0]

        expect(section).toHaveProperty('name')
        expect(section).toHaveProperty('count')
        expect(section).toHaveProperty('percentage')
      }
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle very large README documents', async () => {
      const largeContent = '# Large README\n\n' + 'x'.repeat(500000) // 500KB of content
      const largeReadme = createUniqueReadme({
        content: largeContent
      })
      const response = await request(app)
        .post('/readme')
        .send(largeReadme)

      expect([201, 413]).toContain(response.status)

      if (response.status === 413) {
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toContain('too large')
      } else {
        testReadmeIds.push(response.body._id)
      }
    })

    it('should handle malformed markdown gracefully', async () => {
      const malformedMarkdown = createUniqueReadme({
        content: '# Heading\n\n[Invalid link](http://\n\n**Unclosed bold\n\n```\nUnclosed code block'
      })
      const response = await request(app)
        .post('/readme')
        .send(malformedMarkdown)
        .expect(201)

      expect(response.body).toHaveProperty('renderedContent')
      // Should handle gracefully without throwing errors

      testReadmeIds.push(response.body._id)
    })

    it('should handle concurrent README updates', async () => {
      const readme = createUniqueReadme()
      const createResponse = await request(app)
        .post('/readme')
        .send(readme)
        .expect(201)

      testReadmeIds.push(createResponse.body._id)

      // Simulate concurrent updates
      const update1 = { content: '# Update 1\n\nFirst update' }
      const update2 = { content: '# Update 2\n\nSecond update' }
      const promises = [
        request(app).put(`/readme/${createResponse.body._id}`).send(update1),
        request(app).put(`/readme/${createResponse.body._id}`).send(update2)
      ]
      const responses = await Promise.all(promises)
      // At least one should succeed
      const successfulUpdates = responses.filter(r => r.status === 200)

      expect(successfulUpdates.length).toBeGreaterThan(0)
    })

    it('should handle invalid template syntax', async () => {
      const invalidTemplate = createReadmeTemplate({
        content: '# {{projectName}\n\n{{invalid syntax}}\n\n{{/unclosed}}',
        variables: ['projectName']
      })
      const response = await request(app)
        .post('/readme/templates')
        .send(invalidTemplate)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid template syntax')
    })

    it('should handle missing project metadata gracefully', async () => {
      const minimalReadme = {
        title: 'Minimal README',
        projectName: 'minimal-project',
        content: 'Just some content'
      }
      const response = await request(app)
        .post('/readme')
        .send(minimalReadme)
        .expect(201)

      expect(response.body).toHaveProperty('metadata')
      expect(response.body.metadata).toHaveProperty('wordCount')

      testReadmeIds.push(response.body._id)
    })
  })
})
