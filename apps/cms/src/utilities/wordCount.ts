/**
 * Calculates total word count from plain text.
 * Trims extra whitespace and counts words delimited by spaces/newlines.
 */
export const calculateWordCount = (text?: string | null): number => {
  if (!text || typeof text !== 'string') {
    return 0
  }

  const trimmed = text.trim()
  if (!trimmed) {
    return 0
  }

  // Split on whitespace sequences and filter out empty tokens
  const words = trimmed.split(/\s+/).filter(Boolean)
  return words.length
}

