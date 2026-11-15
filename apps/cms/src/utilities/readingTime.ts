/**
 * Calculates estimated reading time in integer minutes.
 * - Standard reading speed: ~200 words per minute
 * - Returns 0 for 0 words
 * - Returns at least 1 minute for any non-empty content
 */
export const calculateReadingTime = (
  wordCount: number,
  wordsPerMinute: number = 200,
): number => {
  if (!wordCount || wordCount <= 0) {
    return 0
  }

  const speed = wordsPerMinute > 0 ? wordsPerMinute : 200
  const minutes = Math.ceil(wordCount / speed)
  return Math.max(1, minutes)
}

