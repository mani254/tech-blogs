import type { CollectionConfig } from 'payload'
import { generateUniqueSlug } from '@/utilities/slug'

export const authorsHooks: CollectionConfig['hooks'] = {
  beforeValidate: [
    async ({ data, req, operation, originalDoc }) => {
      if (!data) return data

      // If slug is provided and modified, or empty, ensure valid and unique slug
      if (data.name && (!data.slug || (operation === 'create' && !data.slug))) {
        data.slug = await generateUniqueSlug({
          collection: 'authors',
          payload: req.payload,
          slug: data.slug || data.name,
          docId: originalDoc?.id,
        })
      }
      return data
    },
  ],
}

