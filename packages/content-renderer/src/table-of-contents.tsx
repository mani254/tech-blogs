import { ListOrdered } from 'lucide-react'
import type { Article } from './types.js'

export interface TableOfContentsProps {
  sections?: Article['sections']
  title?: string
  className?: string
}

export function TableOfContents({
  sections,
  title = 'Table of Contents',
  className = '',
}: TableOfContentsProps) {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null
  }

  // Filter sections that should be displayed in the TOC
  const tocItems = sections.filter(
    (sec) => !sec.hideFromToc && Boolean(sec.title && sec.anchorId),
  )

  if (tocItems.length <= 1) {
    // If only 1 section or none, TOC is not strictly necessary
    return null
  }

  return (
    <nav
      className={`table-of-contents my-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-5 shadow-2xs ${className}`}
      aria-label="Table of contents"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <ListOrdered className="h-4 w-4" />
        <span>{title}</span>
      </div>

      <ol className="space-y-2 text-sm">
        {tocItems.map((section, idx) => (
          <li key={section.id || section.anchorId || idx}>
            <a
              href={`#${section.anchorId}`}
              className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500 font-mono pt-0.5">
                {(idx + 1).toString().padStart(2, '0')}.
              </span>
              <span className="line-clamp-1 leading-snug">{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
