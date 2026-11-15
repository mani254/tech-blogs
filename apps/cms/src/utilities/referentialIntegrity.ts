import type { PayloadRequest } from 'payload'
import { APIError } from 'payload'

/**
 * Asserts that a media file is not referenced by any article, course, author,
 * user profile, or site-settings global before allowing deletion.
 */
export async function assertMediaNotReferenced(
  req: PayloadRequest,
  id: string | number,
): Promise<void> {
  const mediaId = String(id)

  const mediaDoc = await req.payload
    .findByID({
      collection: 'media',
      id,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)

  const mediaLabel = mediaDoc?.alt || mediaDoc?.filename || `ID ${id}`

  // Parallel, high-speed checks with limit: 1 and depth: 0
  const [articleRef, courseRef, authorRef, userRef, siteSettings] = await Promise.all([
    req.payload.find({
      collection: 'articles',
      where: {
        or: [
          { coverImage: { equals: id } },
          { 'seo.ogImage': { equals: id } },
          { 'sections.content.image': { equals: id } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'courses',
      where: {
        or: [
          { coverImage: { equals: id } },
          { thumbnail: { equals: id } },
          { 'seo.ogImage': { equals: id } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'authors',
      where: { profileImage: { equals: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'users',
      where: { avatar: { equals: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    req.payload
      .findGlobal({
        slug: 'site-settings',
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null),
  ])

  const references: string[] = []

  if (articleRef?.docs?.length) {
    const doc = articleRef.docs[0] as { title?: string; id?: string | number }
    references.push(`Article "${doc.title || doc.id}"`)
  }

  if (courseRef?.docs?.length) {
    const doc = courseRef.docs[0] as { title?: string; id?: string | number }
    references.push(`Course "${doc.title || doc.id}"`)
  }

  if (authorRef?.docs?.length) {
    const doc = authorRef.docs[0] as { name?: string; id?: string | number }
    references.push(`Author "${doc.name || doc.id}"`)
  }

  if (userRef?.docs?.length) {
    const doc = userRef.docs[0] as { email?: string; id?: string | number }
    references.push(`User "${doc.email || doc.id}"`)
  }

  if (siteSettings) {
    const settings = siteSettings as {
      logo?: unknown
      favicon?: unknown
      seo?: { ogImage?: unknown }
    }
    const logoId = typeof settings.logo === 'object' && settings.logo !== null
      ? (settings.logo as { id: string | number }).id
      : settings.logo
    const faviconId = typeof settings.favicon === 'object' && settings.favicon !== null
      ? (settings.favicon as { id: string | number }).id
      : settings.favicon
    const ogId = typeof settings.seo?.ogImage === 'object' && settings.seo?.ogImage !== null
      ? (settings.seo.ogImage as { id: string | number }).id
      : settings.seo?.ogImage

    if (String(logoId) === mediaId) references.push('Site Settings (Logo)')
    if (String(faviconId) === mediaId) references.push('Site Settings (Favicon)')
    if (String(ogId) === mediaId) references.push('Site Settings (Default OG Image)')
  }

  if (references.length > 0) {
    throw new APIError(
      `Cannot delete media "${mediaLabel}": it is currently in use by ${references.join(', ')}. Please remove or replace this media item in the referencing content before deleting.`,
      400,
      undefined,
      true,
    )
  }
}

/**
 * Asserts that a category is not referenced by any article, course, or child category
 * before allowing deletion.
 */
export async function assertCategoryNotReferenced(
  req: PayloadRequest,
  id: string | number,
): Promise<void> {
  const catDoc = await req.payload
    .findByID({
      collection: 'categories',
      id,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)

  const catLabel = catDoc?.name || `ID ${id}`

  const [articleRef, courseRef, childCategoryRef] = await Promise.all([
    req.payload.find({
      collection: 'articles',
      where: { categories: { contains: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'courses',
      where: { categories: { contains: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'categories',
      where: { parent: { equals: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const references: string[] = []

  if (articleRef?.docs?.length) {
    const doc = articleRef.docs[0] as { title?: string; id?: string | number }
    references.push(`Article "${doc.title || doc.id}"`)
  }

  if (courseRef?.docs?.length) {
    const doc = courseRef.docs[0] as { title?: string; id?: string | number }
    references.push(`Course "${doc.title || doc.id}"`)
  }

  if (childCategoryRef?.docs?.length) {
    const doc = childCategoryRef.docs[0] as { name?: string; id?: string | number }
    references.push(`Subcategory "${doc.name || doc.id}"`)
  }

  if (references.length > 0) {
    throw new APIError(
      `Cannot delete category "${catLabel}": it is currently referenced by ${references.join(', ')}. Please reassign or remove this category from the referencing content first.`,
      400,
      undefined,
      true,
    )
  }
}

/**
 * Asserts that a tag is not referenced by any article or course before allowing deletion.
 */
export async function assertTagNotReferenced(
  req: PayloadRequest,
  id: string | number,
): Promise<void> {
  const tagDoc = await req.payload
    .findByID({
      collection: 'tags',
      id,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)

  const tagLabel = tagDoc?.name || `ID ${id}`

  const [articleRef, courseRef] = await Promise.all([
    req.payload.find({
      collection: 'articles',
      where: { tags: { contains: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'courses',
      where: { tags: { contains: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const references: string[] = []

  if (articleRef?.docs?.length) {
    const doc = articleRef.docs[0] as { title?: string; id?: string | number }
    references.push(`Article "${doc.title || doc.id}"`)
  }

  if (courseRef?.docs?.length) {
    const doc = courseRef.docs[0] as { title?: string; id?: string | number }
    references.push(`Course "${doc.title || doc.id}"`)
  }

  if (references.length > 0) {
    throw new APIError(
      `Cannot delete tag "${tagLabel}": it is currently attached to ${references.join(', ')}. Please remove this tag from the referencing content first.`,
      400,
      undefined,
      true,
    )
  }
}

