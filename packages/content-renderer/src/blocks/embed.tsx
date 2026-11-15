import type { EmbedBlockData } from '../types.js'

export interface EmbedBlockProps {
  block: EmbedBlockData
  className?: string
}

// Allowed hostnames for safe iframe embedding
const ALLOWED_EMBED_HOSTS: Record<string, string[]> = {
  codepen: ['codepen.io'],
  figma: ['figma.com', 'www.figma.com'],
  stackblitz: ['stackblitz.com'],
  spotify: ['open.spotify.com'],
  github_gist: ['gist.github.com'],
  twitter: ['twitter.com', 'x.com', 'platform.twitter.com'],
  other: [],
}

function isSafeEmbedUrl(provider: string, url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false
    }

    const allowed = ALLOWED_EMBED_HOSTS[provider] || []
    if (allowed.length === 0) {
      // For 'other' or unspecified, only allow safe HTTPS origins
      return parsed.protocol === 'https:'
    }

    return allowed.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

export function EmbedBlock({ block, className = '' }: EmbedBlockProps) {
  if (!block?.url) {
    return null
  }

  const isSafe = isSafeEmbedUrl(block.provider, block.url)

  if (!isSafe) {
    return (
      <div className={`embed-block my-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm ${className}`}>
        <span>Unable to embed content from untrusted or invalid URL: </span>
        <a href={block.url} target="_blank" rel="noopener noreferrer" className="underline font-mono">
          {block.url}
        </a>
      </div>
    )
  }

  return (
    <figure className={`embed-block my-8 max-w-4xl mx-auto overflow-hidden ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm">
        <iframe
          src={block.url}
          title={block.caption || `${block.provider} embed`}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>

      {block.caption && (
        <figcaption className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}
