import type { Media } from '../types.js'
import { isPopulatedMedia } from './type-guards.js'

export interface ResolvedMediaInfo {
  url: string | null
  alt: string
  width?: number | null
  height?: number | null
  mimeType?: string | null
  caption?: string | null
}

/**
 * Resolves media file information from either a populated Media object or a fallback ID.
 */
export function resolveMediaInfo(
  media: string | Media | null | undefined,
  preferredSize?: 'thumbnail' | 'card' | 'cover',
  fallbackAlt = '',
): ResolvedMediaInfo {
  if (!media) {
    return { url: null, alt: fallbackAlt }
  }

  if (isPopulatedMedia(media)) {
    let chosenUrl = media.url || null
    let chosenWidth = media.width
    let chosenHeight = media.height

    if (preferredSize && media.sizes && media.sizes[preferredSize]) {
      const sizeObj = media.sizes[preferredSize]
      if (sizeObj.url) {
        chosenUrl = sizeObj.url
        chosenWidth = sizeObj.width
        chosenHeight = sizeObj.height
      }
    }

    return {
      url: chosenUrl,
      alt: media.alt || fallbackAlt,
      width: chosenWidth,
      height: chosenHeight,
      mimeType: media.mimeType,
      caption: media.caption,
    }
  }

  // Unpopulated string ID
  return {
    url: typeof media === 'string' && media.startsWith('http') ? media : null,
    alt: fallbackAlt,
  }
}

