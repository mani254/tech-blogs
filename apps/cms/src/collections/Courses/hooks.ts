import type { CollectionConfig } from 'payload'
import { generateUniqueSlug } from '@/utilities/slug'

export const coursesHooks: CollectionConfig['hooks'] = {
  beforeValidate: [
    async ({ data, req, operation, originalDoc }) => {
      if (!data) return data

      // Auto-generate unique slug from title
      if (data.title && (!data.slug || (operation === 'create' && !data.slug))) {
        data.slug = await generateUniqueSlug({
          collection: 'courses',
          payload: req.payload,
          slug: data.slug || data.title,
          docId: originalDoc?.id,
        })
      }

      // Initialize lessonSequence to 0 if undefined
      if (typeof data.lessonSequence !== 'number') {
        data.lessonSequence = 0
      }

      return data
    },
  ],
}

