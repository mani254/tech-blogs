import type { CollectionConfig } from 'payload'
import { generateUniqueSlug } from '../../utilities/slug.ts'
import { assertTagNotReferenced } from '../../utilities/referentialIntegrity.ts'

export const tagsHooks: CollectionConfig['hooks'] = {
  beforeValidate: [
    async ({ data, req, operation, originalDoc }) => {
      if (!data) return data

      // Auto-generate unique slug
      if (data.name && (!data.slug || (operation === 'create' && !data.slug))) {
        data.slug = await generateUniqueSlug({
          collection: 'tags',
          payload: req.payload,
          slug: data.slug || data.name,
          docId: originalDoc?.id,
        })
      }
      return data
    },
  ],
  beforeDelete: [
    async ({ req, id }) => {
      await assertTagNotReferenced(req, id)
    },
  ],
}
