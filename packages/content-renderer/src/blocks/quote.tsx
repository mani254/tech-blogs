import { Quote } from 'lucide-react'
import type { QuoteBlockData } from '../types.js'

export interface QuoteBlockProps {
  block: QuoteBlockData
  className?: string
}

export function QuoteBlock({ block, className = '' }: QuoteBlockProps) {
  if (!block?.quote) {
    return null
  }

  return (
    <figure
      className={`quote-block my-8 max-w-3xl mx-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-6 md:p-8 shadow-2xs ${className}`}
    >
      <div className="mb-3 text-zinc-400 dark:text-zinc-600">
        <Quote className="h-8 w-8" />
      </div>

      <blockquote className="text-lg md:text-xl font-serif italic leading-8 text-zinc-800 dark:text-zinc-200">
        &ldquo;{block.quote}&rdquo;
      </blockquote>

      {(block.attribution || block.source) && (
        <figcaption className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 font-sans">
          {block.attribution && (
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              — {block.attribution}
            </span>
          )}
          {block.attribution && block.source && (
            <span className="text-zinc-400">, </span>
          )}
          {block.source && (
            <cite className="not-italic text-zinc-500">
              {block.source}
            </cite>
          )}
        </figcaption>
      )}
    </figure>
  )
}
