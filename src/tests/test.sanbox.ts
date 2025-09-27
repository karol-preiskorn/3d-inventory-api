/**
 * @file test.sandbox.ts
 * @description Utility functions testing - filtering and data manipulation tests
 * @version 2024-02-03 C2RLO - Initial, 2025-09-27 - Converted to proper test suite
 */

import { describe, expect, it } from '@jest/globals'
import { components, valueAttributeCategory } from '../utils/types'

describe('Utility Functions', () => {
  describe('components filtering', () => {
    it('should filter components based on attributes', () => {
      const allowed: boolean[] = [true]
      const filteredComponents = components.filter((item: { component: string; collection: string; attributes: boolean }) =>
        allowed.includes(item.attributes)
      )

      expect(filteredComponents).toBeDefined()
      expect(Array.isArray(filteredComponents)).toBe(true)

      // Each filtered component should have attributes: true
      filteredComponents.forEach(component => {
        expect(component.attributes).toBe(true)
      })
    })

    it('should handle empty allowed array', () => {
      const allowed: boolean[] = []
      const filteredComponents = components.filter((item: { component: string; collection: string; attributes: boolean }) =>
        allowed.includes(item.attributes)
      )

      expect(filteredComponents).toEqual([])
    })
  })

  describe('attribute category filtering', () => {
    it('should filter attribute categories based on allowed components', () => {
      const allowed: boolean[] = [true]
      const filteredComponents = components.filter((item: { component: string; collection: string; attributes: boolean }) =>
        allowed.includes(item.attributes)
      )

      if (filteredComponents.length > 0) {
        const allowedAttributeCategory = [filteredComponents[0].component]
        const filteredAttributeCategory = valueAttributeCategory.filter((item: { component: string }) =>
          allowedAttributeCategory.includes(item.component)
        )

        expect(filteredAttributeCategory).toBeDefined()
        expect(Array.isArray(filteredAttributeCategory)).toBe(true)

        // Each filtered category should have component matching the allowed list
        filteredAttributeCategory.forEach(category => {
          expect(allowedAttributeCategory).toContain(category.component)
        })
      }
    })

    it('should handle no matching components', () => {
      const allowedAttributeCategory = ['non-existent-component']
      const filteredAttributeCategory = valueAttributeCategory.filter((item: { component: string }) =>
        allowedAttributeCategory.includes(item.component)
      )

      expect(filteredAttributeCategory).toEqual([])
    })
  })
})
