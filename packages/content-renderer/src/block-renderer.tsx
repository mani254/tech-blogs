import type { ArticleBlock } from './types.js'

import { RichTextBlock } from './blocks/rich-text.js'
import { CodeBlock } from './blocks/code.js'
import { ImageBlock } from './blocks/image.js'
import { VideoBlock } from './blocks/video.js'
import { TableBlock } from './blocks/table.js'
import { CalloutBlock } from './blocks/callout.js'
import { QuoteBlock } from './blocks/quote.js'
import { EmbedBlock } from './blocks/embed.js'
import { RelatedArticlesBlock } from './blocks/related-articles.js'
import { ListBlock } from './blocks/list.js'

export interface BlockRendererProps {
  block: ArticleBlock
  className?: string
  articleUrlPrefix?: string
}

export function BlockRenderer({
  block,
  className = '',
  articleUrlPrefix,
}: BlockRendererProps) {
  if (!block || !block.blockType) {
    return null
  }

  switch (block.blockType) {
    case 'richText':
      return <RichTextBlock block={block} className={className} />

    case 'code':
      return <CodeBlock block={block} className={className} />

    case 'image':
      return <ImageBlock block={block} className={className} />

    case 'video':
      return <VideoBlock block={block} className={className} />

    case 'table':
      return <TableBlock block={block} className={className} />

    case 'callout':
      return <CalloutBlock block={block} className={className} />

    case 'quote':
      return <QuoteBlock block={block} className={className} />

    case 'embed':
      return <EmbedBlock block={block} className={className} />

    case 'relatedArticles':
      return (
        <RelatedArticlesBlock
          block={block}
          className={className}
          articleUrlPrefix={articleUrlPrefix}
        />
      )

    case 'list':
      return <ListBlock block={block} className={className} />

    default: {
      // Safe fallback for unhandled or experimental block types
      const unhandled = block as { blockType: string }
      return (
        <div className="my-4 rounded border border-dashed border-zinc-300 dark:border-zinc-700 p-4 text-xs text-zinc-500">
          [Unsupported block type: {unhandled.blockType}]
        </div>
      )
    }
  }
}
