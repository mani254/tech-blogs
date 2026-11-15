import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'provider',
          label: 'Video Provider',
          type: 'select',
          required: true,
          defaultValue: 'youtube',
          options: [
            { label: 'YouTube', value: 'youtube' },
            { label: 'Vimeo', value: 'vimeo' },
            { label: 'Cloudflare Stream', value: 'cloudflare_stream' },
            { label: 'Direct MP4 / WebM URL', value: 'direct_url' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            width: '35%',
          },
        },
        {
          name: 'videoUrl',
          label: 'Video URL or Embed ID',
          type: 'text',
          required: true,
          admin: {
            width: '65%',
            placeholder: 'https://www.youtube.com/watch?v=... or Video ID',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Video Title',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'caption',
          label: 'Caption / Subtitle',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
}

