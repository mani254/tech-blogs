import type { CollectionSlug, Payload } from 'payload'

/**
 * Normalizes a raw string into a clean, URL-safe slug.
 * - Trims whitespace
 * - Converts to lowercase
 * - Strips diacritics / accents
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses consecutive hyphens
 * - Removes leading and trailing hyphens
 */
export const formatSlug = (val: string): string => {
  if (!val) return ''

  return val
    .toString()
    .normalize('NFD') // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // strip diacritic marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid characters
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into hyphen
    .replace(/^-+|-+$/g, '') // strip leading and trailing hyphens
}

interface GenerateUniqueSlugArgs {
  collection: CollectionSlug
  payload: Payload
  slug: string
  docId?: string | number
}

/**
 * Checks for slug collisions in a collection and appends a deterministic suffix (-2, -3, etc.)
 * until a unique slug is guaranteed.
 */
export const generateUniqueSlug = async ({
  collection,
  payload,
  slug,
  docId,
}: GenerateUniqueSlugArgs): Promise<string> => {
  const baseSlug = formatSlug(slug)
  if (!baseSlug) return ''

  let currentSlug = baseSlug
  let counter = 1
  let isUnique = false

  while (!isUnique) {
    // Query for existing documents with this slug (ignore self)
    const existing = await payload.find({
      collection,
      where: {
        and: [
          {
            slug: {
              equals: currentSlug,
            },
          },
          ...(docId
            ? [
                {
                  id: {
                    not_equals: docId,
                  },
                },
              ]
            : []),
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length === 0) {
      isUnique = true
    } else {
      counter += 1
      currentSlug = `${baseSlug}-${counter}`
    }
  }

  return currentSlug
}
