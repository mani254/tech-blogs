import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatSlug, generateUniqueSlug } from '../src/utilities/slug.ts'

describe('Slug Utility Tests', () => {
  it('formats normal titles into clean URL-safe slugs', () => {
    assert.equal(
      formatSlug('Understanding React Server Components'),
      'understanding-react-server-components',
    )
    assert.equal(
      formatSlug('Building Scalable Web APIs with NestJS'),
      'building-scalable-web-apis-with-nestjs',
    )
  })

  it('normalizes accents, diacritics, and special characters', () => {
    assert.equal(formatSlug('Café & Crème Brûlée in Paris!'), 'cafe-creme-brulee-in-paris')
    assert.equal(formatSlug('TypeScript 5.7: What’s New?! (2026 Edition)'), 'typescript-57-whats-new-2026-edition')
    assert.equal(formatSlug('  -- leading and trailing dashes --  '), 'leading-and-trailing-dashes')
    assert.equal(formatSlug('Multiple   spaces   and ___ underscores'), 'multiple-spaces-and-underscores')
  })

  it('handles empty or blank titles gracefully', () => {
    assert.equal(formatSlug(''), '')
    assert.equal(formatSlug('   '), '')
    assert.equal(formatSlug('???!!!***'), '')
  })

  it('preserves manually customized slugs and formats them', () => {
    const customSlug = 'my-custom-editorial-slug'
    assert.equal(formatSlug(customSlug), 'my-custom-editorial-slug')
  })

  it('resolves slug collisions deterministically with suffixes (-2, -3)', async () => {
    // Mock payload instance with in-memory collection state
    const existingSlugs = new Set(['react-performance', 'react-performance-2'])

    const mockPayload: any = {
      find: async ({ where }: any) => {
        const slugToCheck = where.and[0].slug.equals
        if (existingSlugs.has(slugToCheck)) {
          return { docs: [{ id: 'existing-id', slug: slugToCheck }] }
        }
        return { docs: [] }
      },
    }

    const resolvedSlug = await generateUniqueSlug({
      collection: 'articles' as any,
      payload: mockPayload,
      slug: 'React Performance',
    })

    // Because 'react-performance' and 'react-performance-2' exist, it must assign 'react-performance-3'
    assert.equal(resolvedSlug, 'react-performance-3')
  })

  it('ignores self document ID when validating uniqueness during updates', async () => {
    const mockPayload: any = {
      find: async ({ where }: any) => {
        const targetSlug = where.and[0].slug.equals
        const notEqualsId = where.and[1]?.id?.not_equals

        if (targetSlug === 'existing-article' && notEqualsId === 'doc-123') {
          // Self doc: no collision
          return { docs: [] }
        }
        return { docs: [{ id: 'other-doc', slug: targetSlug }] }
      },
    }

    const resolvedSlug = await generateUniqueSlug({
      collection: 'articles' as any,
      payload: mockPayload,
      slug: 'existing-article',
      docId: 'doc-123',
    })

    assert.equal(resolvedSlug, 'existing-article')
  })
})
