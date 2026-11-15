import type { CollectionBeforeValidateHook } from 'payload'
import { generateUniqueSlug } from '@/utilities/slug'

/**
 * Ensures a unique, URL-safe slug is generated from the article title.
 * Preserves manually edited slugs unless explicitly cleared.
 */
export const generateArticleSlug: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return data

  const sourceTitle = data.title || originalDoc?.title

  // If slug is provided and modified, or empty, ensure valid and unique slug
  if (sourceTitle && (!data.slug || (operation === 'create' && !data.slug))) {
    data.slug = await generateUniqueSlug({
      collection: 'articles',
      payload: req.payload,
      slug: data.slug || sourceTitle,
      docId: originalDoc?.id,
    })
  }

  return data
}

