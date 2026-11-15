import type { ImageBlockData } from '../types.js'
import { resolveMediaInfo } from '../utils/media.js'

export interface ImageBlockProps {
  block: ImageBlockData
  className?: string
}

export function ImageBlock({ block, className = '' }: ImageBlockProps) {
  const mediaInfo = resolveMediaInfo(block.image, 'cover', block.alt || '')

  if (!mediaInfo.url) {
    return null
  }

  const alignment = block.alignment || 'center'
  const displayWidth = block.displayWidth || 'normal'

  const alignmentClasses: Record<string, string> = {
    left: 'mr-auto text-left',
    center: 'mx-auto text-center',
    right: 'ml-auto text-right',
    fullWidth: 'w-full',
  }

  const widthClasses: Record<string, string> = {
    normal: 'max-w-3xl',
    wide: 'max-w-5xl',
    full: 'w-full max-w-none',
  }

  const figure = (
    <figure
      className={`my-8 overflow-hidden ${widthClasses[displayWidth] || 'max-w-3xl'} ${
        alignmentClasses[alignment] || 'mx-auto'
      } ${className}`}
    >
      <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm">
        <img
          src={mediaInfo.url}
          alt={block.alt || mediaInfo.alt || ''}
          width={mediaInfo.width ?? undefined}
          height={mediaInfo.height ?? undefined}
          loading="lazy"
          decoding="async"
          className="h-auto w-full object-cover transition-opacity duration-300"
        />
      </div>

      {(block.caption || mediaInfo.caption) && (
        <figcaption className="mt-2.5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {block.caption || mediaInfo.caption}
        </figcaption>
      )}
    </figure>
  )

  if (block.link) {
    return (
      <a
        href={block.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-opacity hover:opacity-90"
      >
        {figure}
      </a>
    )
  }

  return figure
}
