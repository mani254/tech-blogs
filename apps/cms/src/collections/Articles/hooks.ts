import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import {
  generateArticleSlug,
  validateArticleSectionsAndCover,
  calculateArticleWordCount,
  calculateArticleReadingTime,
  generateCoursePageNumber,
  handleArticlePublishing,
} from '@/hooks/articles'

export const articlesHooks: CollectionConfig['hooks'] = {
  beforeValidate: [
    // 1. Author role security guard: prevent authors from altering author ownership or publishing directly
    async ({ data, req, operation, originalDoc }) => {
      if (!data) return data
      const user = req.user

      if (user && user.role === 'author') {
        const userAuthorId = typeof user.authorProfile === 'object' && user.authorProfile !== null
          ? (user.authorProfile as { id: string | number }).id
          : user.authorProfile

        // Force author to be the requesting user's author profile
        if (operation === 'create' && userAuthorId) {
          data.author = userAuthorId
        } else if (operation === 'update' && data.author && String(data.author) !== String(userAuthorId)) {
          throw new APIError('Authors are not permitted to transfer article ownership to another author.', 403, undefined, true)
        }

        // Prevent author from directly publishing
        if (data._status === 'published' && originalDoc?._status !== 'published') {
          throw new APIError('Authors cannot publish articles directly. Please submit for editorial review as a draft.', 403, undefined, true)
        }
      }

      return data
    },

    // 2. Validate sections anchorIds and cover image 16:9 ratio
    validateArticleSectionsAndCover,

    // 3. Generate unique slug
    generateArticleSlug,
  ],

  beforeChange: [
    // 1. Calculate word count from readable sections
    calculateArticleWordCount,

    // 2. Calculate reading time (200 wpm)
    calculateArticleReadingTime,

    // 3. Assign concurrency-safe course lesson sequence if publishing
    generateCoursePageNumber,

    // 4. Manage publishedAt and lastContentUpdatedAt
    handleArticlePublishing,
  ],
}

