import { Clock, ArrowRight } from 'lucide-react'
import type { RelatedArticlesBlockData, Article } from '../types.js'
import { isPopulatedArticle } from '../utils/type-guards.js'
import { resolveMediaInfo } from '../utils/media.js'

export interface RelatedArticlesBlockProps {
  block: RelatedArticlesBlockData
  className?: string
  articleUrlPrefix?: string // Defaults to '/articles'
}

export function RelatedArticlesBlock({
  block,
  className = '',
  articleUrlPrefix = '/articles',
}: RelatedArticlesBlockProps) {
  const articles = block.articles || []

  if (articles.length === 0) {
    return null
  }

  const style = block.displayStyle || 'cards'
  const title = block.title || 'Recommended Articles'

  return (
    <div className={`related-articles-block my-10 ${className}`}>
      <div className="mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      </div>

      {style === 'cards' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {articles.map((item, idx) => {
            if (!isPopulatedArticle(item)) {
              return null
            }

            const article: Article = item
            const mediaInfo = resolveMediaInfo(article.coverImage, 'card')
            const href = `${articleUrlPrefix}/${article.slug}`

            return (
              <a
                key={article.id || idx}
                href={href}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {mediaInfo.url && (
                  <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={mediaInfo.url}
                      alt={mediaInfo.alt || article.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </h4>

                  {article.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 flex-1">
                      {article.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500">
                    {article.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {article.readingTime} min read
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      Read article <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {style === 'list' && (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          {articles.map((item, idx) => {
            if (!isPopulatedArticle(item)) return null
            const article: Article = item
            const href = `${articleUrlPrefix}/${article.slug}`

            return (
              <li key={article.id || idx}>
                <a
                  href={href}
                  className="group flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h4>
                    {article.description && (
                      <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                        {article.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                </a>
              </li>
            )
          })}
        </ul>
      )}

      {style === 'compact' && (
        <div className="flex flex-wrap gap-2">
          {articles.map((item, idx) => {
            if (!isPopulatedArticle(item)) return null
            const article: Article = item
            const href = `${articleUrlPrefix}/${article.slug}`

            return (
              <a
                key={article.id || idx}
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <span>{article.title}</span>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
