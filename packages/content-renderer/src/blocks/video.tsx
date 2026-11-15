import type { VideoBlockData } from '../types.js'

export interface VideoBlockProps {
  block: VideoBlockData
  className?: string
}

function getEmbedUrl(provider: string, videoUrl: string): string | null {
  if (!videoUrl) return null

  try {
    if (provider === 'youtube') {
      // Handles youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
      let videoId: string | null = null
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split(/[?#]/)[0] || null
      } else if (videoUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(videoUrl)
        videoId = urlObj.searchParams.get('v')
      } else if (videoUrl.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('youtube.com/embed/')[1]?.split(/[?#]/)[0] || null
      }

      if (videoId && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`
      }
    }

    if (provider === 'vimeo') {
      // Handles vimeo.com/ID
      const match = videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/)
      const vimeoId = match?.[1]
      if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}`
      }
    }

    if (provider === 'cloudflare_stream') {
      // Cloudflare stream iframe
      if (videoUrl.includes('cloudflarestream.com')) {
        const id = videoUrl.split('cloudflarestream.com/')[1]?.split(/[?#\/]/)[0]
        if (id && /^[a-zA-Z0-9]+$/.test(id)) {
          return `https://iframe.videodelivery.net/${id}`
        }
      }
    }
  } catch {
    return null
  }

  return null
}

export function VideoBlock({ block, className = '' }: VideoBlockProps) {
  if (!block?.videoUrl) {
    return null
  }

  const isDirectUrl = block.provider === 'direct_url'
  const embedUrl = isDirectUrl ? null : getEmbedUrl(block.provider, block.videoUrl)

  return (
    <figure className={`video-block my-8 max-w-4xl mx-auto overflow-hidden ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-black shadow-md">
        {isDirectUrl ? (
          <video
            src={block.videoUrl}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            title={block.title || 'Video Player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-zinc-400">
            <a
              href={block.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Watch video: {block.title || block.videoUrl}
            </a>
          </div>
        )}
      </div>

      {(block.title || block.caption) && (
        <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {block.title && <strong className="text-zinc-700 dark:text-zinc-300">{block.title}: </strong>}
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}
