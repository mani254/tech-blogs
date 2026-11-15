import type { Block } from 'payload'

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: {
    singular: 'Callout',
    plural: 'Callouts',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'variant',
          label: 'Callout Variant',
          type: 'select',
          required: true,
          defaultValue: 'info',
          options: [
            { label: 'Info (Blue)', value: 'info' },
            { label: 'Warning (Amber)', value: 'warning' },
            { label: 'Success (Green)', value: 'success' },
            { label: 'Danger (Red)', value: 'danger' },
            { label: 'Note (Gray)', value: 'note' },
          ],
          admin: {
            width: '35%',
          },
        },
        {
          name: 'title',
          label: 'Callout Title',
          type: 'text',
          admin: {
            width: '65%',
            placeholder: 'e.g. Pro Tip / Important Notice',
          },
        },
      ],
    },
    {
      name: 'content',
      label: 'Callout Content',
      type: 'richText',
      required: true,
    },
  ],
}

