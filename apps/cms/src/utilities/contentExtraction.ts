interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

interface LexicalData {
  root?: LexicalNode
  [key: string]: unknown
}

/**
 * Extracts plain text from Lexical editor JSON structure.
 * Skips code blocks and technical nodes by default to ensure accurate word counts and reading times.
 */
export const extractTextFromLexical = (
  lexicalData?: LexicalData | null,
  options: { excludeCode?: boolean } = { excludeCode: true },
): string => {
  if (!lexicalData || !lexicalData.root) {
    return ''
  }

  const textPieces: string[] = []

  const traverse = (node: LexicalNode): void => {
    if (!node) return

    // Explicitly exclude code blocks and code lines
    if (options.excludeCode && (node.type === 'code' || node.type === 'code-highlight')) {
      return
    }

    if (typeof node.text === 'string' && node.text.trim()) {
      textPieces.push(node.text.trim())
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  traverse(lexicalData.root)
  return textPieces.join(' ')
}

export interface ContentBlock {
  blockType: string
  [key: string]: unknown
}

export interface ArticleSection {
  title?: string
  anchorId?: string
  description?: string
  hideFromToc?: boolean
  content?: ContentBlock[]
}

/**
 * Traverses an article's section array and nested blocks, extracting all readable human text.
 * Strictly excludes:
 * - Code blocks
 * - Embed URLs and technical scripts
 * - Image file metadata
 */
export const extractTextFromSections = (
  sections?: ArticleSection[] | null,
  options: { excludeCode?: boolean } = { excludeCode: true },
): string => {
  if (!Array.isArray(sections) || sections.length === 0) {
    return ''
  }

  const chunks: string[] = []

  for (const section of sections) {
    if (!section) continue

    if (section.title) {
      chunks.push(section.title)
    }

    if (section.description) {
      chunks.push(section.description)
    }

    if (Array.isArray(section.content)) {
      for (const block of section.content) {
        if (!block || typeof block !== 'object') continue

        switch (block.blockType) {
          case 'richText': {
            const richTextData = block.content as LexicalData
            const text = extractTextFromLexical(richTextData, options)
            if (text) chunks.push(text)
            break
          }

          case 'callout': {
            if (typeof block.title === 'string' && block.title) {
              chunks.push(block.title)
            }
            if (typeof block.content === 'string' && block.content) {
              chunks.push(block.content)
            } else if (typeof block.content === 'object' && block.content !== null) {
              const text = extractTextFromLexical(block.content as LexicalData, options)
              if (text) chunks.push(text)
            }
            break
          }

          case 'quote': {
            if (typeof block.quote === 'string' && block.quote) {
              chunks.push(block.quote)
            }
            if (typeof block.attribution === 'string' && block.attribution) {
              chunks.push(block.attribution)
            }
            break
          }

          case 'table': {
            if (typeof block.caption === 'string' && block.caption) {
              chunks.push(block.caption)
            }
            if (Array.isArray(block.columns)) {
              for (const col of block.columns) {
                if (typeof col?.header === 'string' && col.header) {
                  chunks.push(col.header)
                }
              }
            }
            if (Array.isArray(block.rows)) {
              for (const row of block.rows) {
                if (Array.isArray(row?.cells)) {
                  for (const cell of row.cells) {
                    if (typeof cell?.value === 'string' && cell.value) {
                      chunks.push(cell.value)
                    }
                  }
                }
              }
            }
            break
          }

          case 'list': {
            if (Array.isArray(block.items)) {
              for (const item of block.items) {
                if (typeof item?.text === 'string' && item.text) {
                  chunks.push(item.text)
                }
              }
            }
            break
          }

          // Code blocks, Image, Video, Embed, RelatedArticles are excluded from primary word count/reading time
          case 'code':
          case 'image':
          case 'video':
          case 'embed':
          case 'relatedArticles':
          default:
            break
        }
      }
    }
  }

  return chunks.join(' ')
}

