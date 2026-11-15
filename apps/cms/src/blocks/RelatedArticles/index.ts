import type { Block } from 'payload'

export const RelatedArticlesBlock: Block = {
  slug: 'relatedArticles',
  labels: {
    singular: 'Related Articles Block',
    plural: 'Related Articles Blocks',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Section Title',
          type: 'text',
          defaultValue: 'Related Articles',
          admin: {
            width: '60%',
          },
        },
        {
          name: 'displayStyle',
          label: 'Display Layout',
          type: 'select',
          defaultValue: 'cards',
          options: [
            { label: 'Card Grid', value: 'cards' },
            { label: 'Detailed List', value: 'list' },
            { label: 'Compact List', value: 'compact' },
          ],
          admin: {
            width: '40%',
          },
        },
      ],
    },
    {
      name: 'articles',
      label: 'Articles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      required: true,
      admin: {
        description: 'Select articles manually to recommend to the reader.',
      },
    },
  ],
}

