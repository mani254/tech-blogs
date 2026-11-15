import type { Field } from 'payload'

/**
 * Reusable social links field for Authors, SiteSettings, and Footers.
 */
export const socialLinksField: Field = {
  name: 'socialLinks',
  label: 'Social Media Links',
  type: 'array',
  admin: {
    description: 'Profiles on social platforms (GitHub, Twitter/X, LinkedIn, YouTube, etc.)',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'platform',
          label: 'Platform',
          type: 'select',
          required: true,
          defaultValue: 'website',
          options: [
            { label: 'GitHub', value: 'github' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Personal Website', value: 'website' },
            { label: 'Discord', value: 'discord' },
            { label: 'Twitch', value: 'twitch' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            width: '30%',
          },
        },
        {
          name: 'url',
          label: 'Profile URL',
          type: 'text',
          required: true,
          admin: {
            width: '45%',
          },
        },
        {
          name: 'label',
          label: 'Display Label',
          type: 'text',
          admin: {
            width: '25%',
            placeholder: 'e.g. @username',
          },
        },
      ],
    },
  ],
}

export interface LinkFieldOptions {
  name?: string
  label?: string
  includeNewTab?: boolean
}

/**
 * Reusable link field supporting internal relationships (Articles, Courses, Categories) or custom external URLs.
 */
export const linkField = ({
  name = 'link',
  label = 'Link',
  includeNewTab = true,
}: LinkFieldOptions = {}): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Link Type',
          type: 'radio',
          defaultValue: 'reference',
          options: [
            { label: 'Internal Content', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'label',
          label: 'Link Text',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'reference',
      label: 'Document to link to',
      type: 'relationship',
      relationTo: ['articles', 'courses', 'categories'],
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
    },
    {
      name: 'url',
      label: 'Custom URL',
      type: 'text',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
        placeholder: 'https://example.com/page',
      },
    },
    ...(includeNewTab
      ? [
          {
            name: 'newTab',
            label: 'Open in new tab',
            type: 'checkbox' as const,
            defaultValue: false,
          },
        ]
      : []),
  ],
})

