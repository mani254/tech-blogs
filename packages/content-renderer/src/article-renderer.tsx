import { Clock, Calendar, User } from 'lucide-react'
import type { Article } from './types.js'
import { isPopulatedAuthor } from './utils/type-guards.js'
import { resolveMediaInfo } from './utils/media.js'
import { TableOfContents } from './table-of-contents.js'
import { SectionRenderer } from './section-renderer.js'

export interface ArticleRendererProps {
  article: Article
  showCoverImage?: boolean
  showToc?: boolean
  showMetadataHeader?: boolean
  articleUrlPrefix?: string
  className?: string
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function ArticleRenderer({
  article,
  showCoverImage = true,
  showToc = true,
  showMetadataHeader = true,
  articleUrlPrefix = '/articles',
  className = '',
}: ArticleRendererProps) {
  if (!article) {
    return null
  }

  const sections = article.sections || []
  const coverMedia = resolveMediaInfo(article.coverImage, 'cover', article.title)
  const authorName = isPopulatedAuthor(article.author) ? article.author.name : null
  const authorDesignation = isPopulatedAuthor(article.author) ? article.author.designation : null
  const formattedPublishDate = formatDate(article.publishedAt || article.createdAt)

  return (
    <article className={`article-renderer max-w-4xl mx-auto px-4 py-8 md:py-12 ${className}`}>
      {/* Article Header & Metadata */}
      {showMetadataHeader && (
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          {/* Classification & Reading Time Pill */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-medium">
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 uppercase tracking-wider text-[11px]">
              {article.articleType || 'Article'}
            </span>

            {article.readingTime && (
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{article.readingTime} min read</span>
              </span>
            )}

            {formattedPublishDate && (
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={article.publishedAt || article.createdAt}>
                  {formattedPublishDate}
                </time>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
            {article.title}
          </h1>

          {/* Summary / Excerpt */}
          {article.description && (
            <p className="mt-4 text-lg md:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              {article.description}
            </p>
          )}

          {/* Author Byline */}
          {authorName && (
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {authorName}
                </p>
                {authorDesignation && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {authorDesignation}
                  </p>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      {/* Cover Image */}
      {showCoverImage && coverMedia.url && (
        <figure className="mb-10 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-md">
          <img
            src={coverMedia.url}
            alt={coverMedia.alt || article.title}
            width={coverMedia.width ?? undefined}
            height={coverMedia.height ?? undefined}
            className="aspect-video w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </figure>
      )}

      {/* Table of Contents */}
      {showToc && <TableOfContents sections={sections} />}

      {/* Ordered Sections */}
      <div className="article-body">
        {sections.map((section, idx) => (
          <SectionRenderer
            key={section.id || section.anchorId || `sec-${idx}`}
            section={section}
            index={idx}
            articleUrlPrefix={articleUrlPrefix}
          />
        ))}
      </div>
    </article>
  )
}
