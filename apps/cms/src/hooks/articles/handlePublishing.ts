import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'
import { APIError } from 'payload'
import { formatSlug } from '../../utilities/slug.ts'

/**
 * Validates cover image 16:9 aspect ratio and validates/generates unique section anchorIds.
 */
export const validateArticleSectionsAndCover: CollectionBeforeValidateHook = async ({
  data,
  req,
}) => {
  if (!data) return data

  // 1. Process Sections and ensure stable, unique anchorIds
  if (Array.isArray(data.sections)) {
    const seenAnchorIds = new Set<string>()

    data.sections = data.sections.map((section: { anchorId?: string; title?: string; [key: string]: unknown }, index: number) => {
      let anchor = section.anchorId

      // Auto-generate anchorId from title if not set
      if (!anchor && section.title) {
        anchor = formatSlug(section.title)
      }

      // Fallback anchor if title is also empty
      if (!anchor) {
        anchor = `section-${index + 1}`
      }

      // Ensure uniqueness within the article
      let uniqueAnchor = anchor
      let suffix = 2
      while (seenAnchorIds.has(uniqueAnchor)) {
        uniqueAnchor = `${anchor}-${suffix}`
        suffix += 1
      }

      seenAnchorIds.add(uniqueAnchor)
      return {
        ...section,
        anchorId: uniqueAnchor,
      }
    })
  }

  // 2. Validate Cover Image 16:9 Aspect Ratio
  const coverImageId = typeof data.coverImage === 'object' && data.coverImage !== null
    ? (data.coverImage as { id: string | number }).id
    : data.coverImage

  if (coverImageId) {
    try {
      const mediaDoc = await req.payload.findByID({
        collection: 'media',
        id: coverImageId,
        depth: 0,
      })

      if (mediaDoc) {
        const width = mediaDoc.width
        const height = mediaDoc.height

        if (typeof width === 'number' && typeof height === 'number') {
          // Verify minimum dimensions (1200 x 675)
          if (width < 1200 || height < 675) {
            throw new APIError(
              `Cover Image Resolution Error: Article cover image must meet the minimum resolution of 1200x675. Uploaded image resolution is ${width}x${height}. Please upload an image with at least 1200px width and 675px height.`,
              400,
              undefined,
              true,
            )
          }

          // Verify 16:9 aspect ratio (1.7777... ± 0.06 tolerance)
          const ratio = width / height
          const targetRatio = 16 / 9
          const tolerance = 0.06

          if (Math.abs(ratio - targetRatio) > tolerance) {
            const formattedRatio = ratio.toFixed(2)
            throw new APIError(
              `Cover Image Aspect Ratio Error: Article cover image must adhere to a 16:9 aspect ratio. Selected image dimensions (${width}x${height}) produce a ratio of ${formattedRatio}:1. Please crop or upload a 16:9 widescreen image.`,
              400,
              undefined,
              true,
            )
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof APIError || (err instanceof Error && err.message.toLowerCase().includes('cover image'))) {
        throw err
      }
      // If mediaDoc lookup failed, log and proceed
      req.payload.logger.warn(`[validateArticleSectionsAndCover] Media lookup warning: ${err}`)
    }
  }

  return data
}

/**
 * Manages publication timestamps.
 * - Sets publishedAt on first publication
 * - Updates lastContentUpdatedAt on content edits
 */
export const handleArticlePublishing: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (!data) return data

  const isPublishing = data._status === 'published'
  const wasAlreadyPublished = originalDoc?._status === 'published'

  // First time being published
  if (isPublishing && !wasAlreadyPublished && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }

  // Content revision tracking
  if (operation === 'update' && wasAlreadyPublished) {
    data.lastContentUpdatedAt = new Date().toISOString()
  }

  return data
}
