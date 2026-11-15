import type { Block } from 'payload'

export const ListBlock: Block = {
  slug: 'list',
  labels: {
    singular: 'Structured List',
    plural: 'Structured Lists',
  },
  fields: [
    {
      name: 'listType',
      label: 'List Style',
      type: 'select',
      required: true,
      defaultValue: 'bullet',
      options: [
        { label: 'Bullet List (Unordered)', value: 'bullet' },
        { label: 'Numbered List (Ordered)', value: 'numbered' },
        { label: 'Checklist / Task List', value: 'check' },
      ],
    },
    {
      name: 'items',
      label: 'List Items',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'text',
              label: 'Item Text',
              type: 'text',
              required: true,
              admin: {
                width: '80%',
              },
            },
            {
              name: 'checked',
              label: 'Checked (for task lists)',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                width: '20%',
              },
            },
          ],
        },
      ],
    },
  ],
}

