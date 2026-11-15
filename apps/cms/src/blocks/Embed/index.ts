import type { Block } from 'payload'

export const EmbedBlock: Block = {
  slug: 'embed',
  labels: {
    singular: 'Interactive Embed',
    plural: 'Interactive Embeds',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'provider',
          label: 'Embed Provider',
          type: 'select',
          required: true,
          defaultValue: 'github_gist',
          options: [
            { label: 'GitHub Gist', value: 'github_gist' },
            { label: 'CodePen', value: 'codepen' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Figma', value: 'figma' },
            { label: 'StackBlitz', value: 'stackblitz' },
            { label: 'Spotify', value: 'spotify' },
            { label: 'Other Allowed Provider', value: 'other' },
          ],
          admin: {
            width: '35%',
          },
        },
        {
          name: 'url',
          label: 'Embed URL or Identifier',
          type: 'text',
          required: true,
          admin: {
            width: '65%',
            placeholder: 'https://...',
          },
        },
      ],
    },
    {
      name: 'caption',
      label: 'Embed Caption / Description',
      type: 'text',
    },
  ],
}

