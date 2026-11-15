import type { CollectionBeforeChangeHook } from 'payload'
import { extractTextFromSections } from '@/utilities/contentExtraction'
import { calculateWordCount } from '@/utilities/wordCount'

/**
 * Computes the total word count from the article's sections and description, strictly excluding code blocks.
 */
export const calculateArticleWordCount: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data

  const bodyText = extractTextFromSections(data.sections, { excludeCode: true })
  const descText = typeof data.description === 'string' ? data.description : ''
  const fullText = `${descText} ${bodyText}`.trim()

  data.wordCount = calculateWordCount(fullText)
  return data
}

