import { Hash } from 'lucide-react'
import type { ArticleSection } from './types.js'
import { BlockRenderer } from './block-renderer.js'

export interface SectionRendererProps {
  section: ArticleSection
  index?: number
  className?: string
  articleUrlPrefix?: string
}

export function SectionRenderer({
  section,
  index = 0,
  className = '',
  articleUrlPrefix,
}: SectionRendererProps) {
  if (!section) {
    return null
  }

  const anchorId = section.anchorId || `section-${index + 1}`
  const blocks = section.content || []

  return (
    <section
      id={anchorId}
      className={`article-section my-12 scroll-mt-24 first:mt-6 last:mb-6 ${className}`}
      aria-labelledby={`heading-${anchorId}`}
    >
      {/* Section Heading */}
      {section.title && (
        <div className="group mb-4 flex items-center">
          <h2
            id={`heading-${anchorId}`}
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {section.title}
          </h2>
          <a
            href={`#${anchorId}`}
            className="ml-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-blue-600 focus:opacity-100"
            aria-label={`Link to section: ${section.title}`}
          >
            <Hash className="h-5 w-5" />
          </a>
        </div>
      )}

      {/* Section Subheading / Description */}
      {section.description && (
        <p className="mb-6 text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
          {section.description}
        </p>
      )}

      {/* Section Content Blocks */}
      <div className="section-blocks space-y-6">
        {blocks.map((block, blockIdx) => (
          <BlockRenderer
            key={block.id || `${anchorId}-block-${blockIdx}`}
            block={block}
            articleUrlPrefix={articleUrlPrefix}
          />
        ))}
      </div>
    </section>
  )
}
