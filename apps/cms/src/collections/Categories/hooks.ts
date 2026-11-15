import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { generateUniqueSlug } from '../../utilities/slug.ts'
import { assertCategoryNotReferenced } from '../../utilities/referentialIntegrity.ts'

export const categoriesHooks: CollectionConfig['hooks'] = {
  beforeValidate: [
    async ({ data, req, operation, originalDoc }) => {
      if (!data) return data

      // Auto-generate unique slug
      if (data.name && (!data.slug || (operation === 'create' && !data.slug))) {
        data.slug = await generateUniqueSlug({
          collection: 'categories',
          payload: req.payload,
          slug: data.slug || data.name,
          docId: originalDoc?.id,
        })
      }

      // Prevent circular parent references
      const docId = originalDoc?.id || (data as { id?: string | number })?.id
      const parentId = typeof data.parent === 'object' && data.parent !== null
        ? (data.parent as { id: string | number }).id
        : data.parent

      if (docId && parentId) {
        if (String(docId) === String(parentId)) {
          throw new APIError('A category cannot designate itself as its own parent category.', 400, undefined, true)
        }

        // Traverse upwards from the prospective parent to ensure the current category is not in the ancestor tree
        let currentAncestorId: string | number | undefined = parentId
        const visitedAncestors = new Set<string>([String(docId)])

        while (currentAncestorId) {
          const ancestorStr = String(currentAncestorId)
          if (visitedAncestors.has(ancestorStr)) {
            throw new APIError('Circular hierarchy detected: a category cannot have one of its descendants as its parent.', 400, undefined, true)
          }
          visitedAncestors.add(ancestorStr)

          try {
            const ancestorDoc = await req.payload.findByID({
              collection: 'categories',
              id: currentAncestorId,
              depth: 0,
            })

            const nextParent = ancestorDoc?.parent
            currentAncestorId = typeof nextParent === 'object' && nextParent !== null
              ? (nextParent as { id: string | number }).id
              : (nextParent as string | number | undefined)
          } catch {
            break
          }
        }
      }

      return data
    },
  ],
  beforeDelete: [
    async ({ req, id }) => {
      await assertCategoryNotReferenced(req, id)
    },
  ],
}
