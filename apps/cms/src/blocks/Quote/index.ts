import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: {
    singular: 'Pull Quote',
    plural: 'Pull Quotes',
  },
  fields: [
    {
      name: 'quote',
      label: 'Quote Text',
      type: 'textarea',
      required: true,
      admin: {
        placeholder: 'e.g. Any fool can write code that a computer can understand...',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'attribution',
          label: 'Attribution / Author',
          type: 'text',
          admin: {
            width: '50%',
            placeholder: 'e.g. Martin Fowler',
          },
        },
        {
          name: 'source',
          label: 'Source / Book / Title',
          type: 'text',
          admin: {
            width: '50%',
            placeholder: 'e.g. Refactoring: Improving the Design of Existing Code',
          },
        },
      ],
    },
  ],
}

