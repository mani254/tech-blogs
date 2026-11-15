import type { Block } from 'payload'

export const TableBlock: Block = {
  slug: 'table',
  labels: {
    singular: 'Data Table',
    plural: 'Data Tables',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'caption',
          label: 'Table Caption',
          type: 'text',
          admin: {
            width: '50%',
            placeholder: 'e.g. Comparison of React vs Vue Rendering Models',
          },
        },
        {
          name: 'hasHeaderRow',
          label: 'Include Header Row',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'isResponsive',
          label: 'Enable Horizontal Scroll on Mobile',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '25%',
          },
        },
      ],
    },
    {
      name: 'columns',
      label: 'Columns Definition',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'header',
              label: 'Column Header',
              type: 'text',
              required: true,
              admin: {
                width: '70%',
              },
            },
            {
              name: 'alignment',
              label: 'Text Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              admin: {
                width: '30%',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'rows',
      label: 'Table Rows',
      type: 'array',
      fields: [
        {
          name: 'cells',
          label: 'Row Cells',
          type: 'array',
          fields: [
            {
              name: 'value',
              label: 'Cell Value',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}

