import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateArticleSectionsAndCover } from '../src/hooks/articles/handlePublishing.ts'
import { categoriesHooks } from '../src/collections/Categories/hooks.ts'

describe('Data Validation & Integrity Tests', () => {
  it('validates 16:9 aspect ratio and minimum resolution for article cover images', async () => {
    // Mock media lookup
    const mockPayload: any = {
      findByID: async ({ id }: any) => {
        if (id === 'valid-cover-id') {
          return { id: 'valid-cover-id', width: 1920, height: 1080 } // Exactly 16:9, >= 1200x675
        }
        if (id === 'small-cover-id') {
          return { id: 'small-cover-id', width: 800, height: 450 } // 16:9 but too small (<1200x675)
        }
        if (id === 'square-cover-id') {
          return { id: 'square-cover-id', width: 1200, height: 1200 } // 1:1 ratio, invalid
        }
        return null
      },
      logger: { warn: console.warn },
    }

    // 1. Valid cover passes
    const validData: any = { coverImage: 'valid-cover-id' }
    await assert.doesNotReject(async () => {
      await validateArticleSectionsAndCover({
        data: validData,
        req: { payload: mockPayload } as any,
      } as any)
    })

    // 2. Small cover throws error
    const smallData: any = { coverImage: 'small-cover-id' }
    await assert.rejects(
      async () => {
        await validateArticleSectionsAndCover({
          data: smallData,
          req: { payload: mockPayload } as any,
        } as any)
      },
      /minimum resolution of 1200x675/,
    )

    // 3. Square cover throws aspect ratio error
    const squareData: any = { coverImage: 'square-cover-id' }
    await assert.rejects(
      async () => {
        await validateArticleSectionsAndCover({
          data: squareData,
          req: { payload: mockPayload } as any,
        } as any)
      },
      /adhere to a 16:9 aspect ratio/,
    )
  })

  it('guarantees unique, stable anchorIds across article sections', async () => {
    const data: any = {
      sections: [
        { title: 'Getting Started' }, // Should get 'getting-started'
        { title: 'Getting Started' }, // Should get 'getting-started-2'
        { title: 'Getting Started' }, // Should get 'getting-started-3'
        { title: '' }, // Fallback to 'section-4'
      ],
    }

    const result: any = await validateArticleSectionsAndCover({
      data,
      req: { payload: { findByID: async () => null, logger: { warn: () => {} } } } as any,
    } as any)

    assert.equal(result.sections[0].anchorId, 'getting-started')
    assert.equal(result.sections[1].anchorId, 'getting-started-2')
    assert.equal(result.sections[2].anchorId, 'getting-started-3')
    assert.equal(result.sections[3].anchorId, 'section-4')
  })

  it('prevents a category from designating itself as its own parent', async () => {
    const beforeValidateHook = categoriesHooks?.beforeValidate?.[0]
    assert.ok(beforeValidateHook, 'Category beforeValidate hook must exist')

    await assert.rejects(
      async () => {
        await beforeValidateHook({
          data: { name: 'Engineering', slug: 'engineering', parent: 'cat-123' },
          originalDoc: { id: 'cat-123', name: 'Engineering' },
          req: { payload: { find: async () => ({ docs: [] }) } } as any,
          operation: 'update',
        } as any)
      },
      /cannot designate itself as its own parent/,
    )
  })

  it('detects and prevents circular hierarchy cycles among categories', async () => {
    const beforeValidateHook = categoriesHooks?.beforeValidate?.[0]
    assert.ok(beforeValidateHook, 'Category beforeValidate hook must exist')

    // Mock category hierarchy: Cat-A -> Cat-B -> Cat-C
    const mockCategories: Record<string, any> = {
      'cat-A': { id: 'cat-A', name: 'Category A', parent: 'cat-B' },
      'cat-B': { id: 'cat-B', name: 'Category B', parent: 'cat-C' },
      'cat-C': { id: 'cat-C', name: 'Category C', parent: null },
    }

    const mockPayload: any = {
      findByID: async ({ id }: any) => mockCategories[id] || null,
      find: async () => ({ docs: [] }),
    }

    // Now attempt to make Cat-C's parent Cat-A -> cycle!
    await assert.rejects(
      async () => {
        await beforeValidateHook({
          data: { name: 'Category C', parent: 'cat-A' },
          originalDoc: { id: 'cat-C', name: 'Category C' },
          req: { payload: mockPayload } as any,
          operation: 'update',
        } as any)
      },
      /Circular hierarchy detected/,
    )
  })
})
