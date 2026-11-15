import type { Block } from 'payload'
import { CalloutBlock } from './Callout'
import { CodeBlock } from './Code'
import { EmbedBlock } from './Embed'
import { ImageBlock } from './Image'
import { ListBlock } from './List'
import { QuoteBlock } from './Quote'
import { RelatedArticlesBlock } from './RelatedArticles'
import { RichTextBlock } from './RichText'
import { TableBlock } from './Table'
import { VideoBlock } from './Video'

export {
  CalloutBlock,
  CodeBlock,
  EmbedBlock,
  ImageBlock,
  ListBlock,
  QuoteBlock,
  RelatedArticlesBlock,
  RichTextBlock,
  TableBlock,
  VideoBlock,
}

/**
 * Full palette of reusable content blocks available for Article sections.
 */
export const articleBlocks: Block[] = [
  RichTextBlock,
  CodeBlock,
  ImageBlock,
  VideoBlock,
  TableBlock,
  CalloutBlock,
  QuoteBlock,
  EmbedBlock,
  RelatedArticlesBlock,
  ListBlock,
]

