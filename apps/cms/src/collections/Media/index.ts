import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { mediaAccess } from './access'
import { mediaHooks } from './hooks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'mediaCategory', 'mimeType', 'filesize', 'createdAt'],
    group: 'Content Assets',
  },
  access: mediaAccess,
  hooks: mediaHooks,
  upload: {
    staticDir: path.resolve(dirname, '../../../../public/media'),
    adminThumbnail: 'thumbnail',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 225, // 16:9 aspect ratio
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 432, // 16:9 aspect ratio
        position: 'centre',
      },
      {
        name: 'cover',
        width: 1200,
        height: 675, // Standard 16:9 minimum dimension
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt Text (Screen Readers & SEO)',
      type: 'text',
      required: true,
      admin: {
        description: 'Provide descriptive alternative text for accessibility.',
      },
    },
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
      admin: {
        description: 'Optional display caption when rendered inside articles.',
      },
    },
    {
      name: 'mediaCategory',
      label: 'Media Category',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'Article Cover Image', value: 'article_cover' },
        { label: 'Article Body Content', value: 'content_image' },
        { label: 'Course Cover / Thumbnail', value: 'course_cover' },
        { label: 'Author Avatar', value: 'avatar' },
        { label: 'General Asset', value: 'general' },
      ],
      admin: {
        description: 'Helps organize media library assets by purpose.',
      },
    },
    {
      name: 'uploadedBy',
      label: 'Uploaded By',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => Boolean(data?.id),
        description: 'Automatically recorded CMS account that uploaded this asset.',
      },
    },
  ],
  timestamps: true,
}

