import type { CollectionBeforeChangeHook } from 'payload'
import { calculateReadingTime } from '@/utilities/readingTime'

/**
 * Computes estimated reading time in minutes based on total calculated word count.
 * Minimum 1 minute for any non-empty article.
 */
export const calculateArticleReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data

  const words = typeof data.wordCount === 'number' ? data.wordCount : 0
  data.readingTime = calculateReadingTime(words, 200)

  return data
}

