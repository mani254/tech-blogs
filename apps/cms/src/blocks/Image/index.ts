import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  fields: [
    {
      name: 'image',
      label: 'Image File',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'alt',
          label: 'Alt Text (Accessibility)',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Screen reader accessibility description.',
          },
        },
        {
          name: 'caption',
          label: 'Caption',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Displayed underneath the image.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'alignment',
          label: 'Alignment',
          type: 'select',
          defaultValue: 'center',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
            { label: 'Full Width', value: 'fullWidth' },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'displayWidth',
          label: 'Display Width',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { label: 'Standard Content Width', value: 'normal' },
            { label: 'Wide / Bleed', value: 'wide' },
            { label: 'Full Screen', value: 'full' },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'link',
          label: 'Click-through Link URL',
          type: 'text',
          admin: {
            width: '34%',
            placeholder: 'https://...',
          },
        },
      ],
    },
  ],
}

