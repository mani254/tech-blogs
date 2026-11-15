import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertMediaNotReferenced,
  assertCategoryNotReferenced,
  assertTagNotReferenced,
} from '../src/utilities/referentialIntegrity.ts'

describe('Referential Integrity Protection Tests', () => {
  describe('assertMediaNotReferenced', () => {
    it('blocks deletion when media is used as cover image in an article', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'media-1', filename: 'hero.jpg', alt: 'Hero Banner' }),
          find: async ({ collection }: any) => {
            if (collection === 'articles') {
              return { docs: [{ id: 'art-1', title: 'Intro to Distributed Systems' }] }
            }
            return { docs: [] }
          },
          findGlobal: async () => null,
        },
      }

      await assert.rejects(
        async () => {
          await assertMediaNotReferenced(mockReq, 'media-1')
        },
        /Cannot delete media "Hero Banner": it is currently in use by Article "Intro to Distributed Systems"/,
      )
    })

    it('blocks deletion when media is used in Site Settings (Logo)', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'logo-1', filename: 'logo.svg' }),
          find: async () => ({ docs: [] }),
          findGlobal: async ({ slug }: any) => {
            if (slug === 'site-settings') {
              return { logo: 'logo-1' }
            }
            return null
          },
        },
      }

      await assert.rejects(
        async () => {
          await assertMediaNotReferenced(mockReq, 'logo-1')
        },
        /Cannot delete media "logo.svg": it is currently in use by Site Settings \(Logo\)/,
      )
    })

    it('allows deletion when media is not referenced anywhere', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'orphan-1', filename: 'unused.png' }),
          find: async () => ({ docs: [] }),
          findGlobal: async () => null,
        },
      }

      await assert.doesNotReject(async () => {
        await assertMediaNotReferenced(mockReq, 'orphan-1')
      })
    })
  })

  describe('assertCategoryNotReferenced', () => {
    it('blocks deletion when category is referenced by an article', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'cat-eng', name: 'Software Engineering' }),
          find: async ({ collection }: any) => {
            if (collection === 'articles') {
              return { docs: [{ id: 'art-2', title: 'Scaling Redis Clusters' }] }
            }
            return { docs: [] }
          },
        },
      }

      await assert.rejects(
        async () => {
          await assertCategoryNotReferenced(mockReq, 'cat-eng')
        },
        /Cannot delete category "Software Engineering": it is currently referenced by Article "Scaling Redis Clusters"/,
      )
    })

    it('blocks deletion when category has child subcategories', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'cat-parent', name: 'Backend' }),
          find: async ({ collection, where }: any) => {
            if (collection === 'categories' && where?.parent) {
              return { docs: [{ id: 'cat-child', name: 'Database Architecture' }] }
            }
            return { docs: [] }
          },
        },
      }

      await assert.rejects(
        async () => {
          await assertCategoryNotReferenced(mockReq, 'cat-parent')
        },
        /Cannot delete category "Backend": it is currently referenced by Subcategory "Database Architecture"/,
      )
    })

    it('allows deletion when category is unreferenced', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'cat-unused', name: 'Legacy Category' }),
          find: async () => ({ docs: [] }),
        },
      }

      await assert.doesNotReject(async () => {
        await assertCategoryNotReferenced(mockReq, 'cat-unused')
      })
    })
  })

  describe('assertTagNotReferenced', () => {
    it('blocks deletion when tag is attached to an article or course', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'tag-ts', name: 'TypeScript' }),
          find: async ({ collection }: any) => {
            if (collection === 'courses') {
              return { docs: [{ id: 'course-1', title: 'Mastering TypeScript 5' }] }
            }
            return { docs: [] }
          },
        },
      }

      await assert.rejects(
        async () => {
          await assertTagNotReferenced(mockReq, 'tag-ts')
        },
        /Cannot delete tag "TypeScript": it is currently attached to Course "Mastering TypeScript 5"/,
      )
    })

    it('allows deletion when tag is unreferenced', async () => {
      const mockReq: any = {
        payload: {
          findByID: async () => ({ id: 'tag-unused', name: 'Deprecated Tech' }),
          find: async () => ({ docs: [] }),
        },
      }

      await assert.doesNotReject(async () => {
        await assertTagNotReferenced(mockReq, 'tag-unused')
      })
    })
  })
})

