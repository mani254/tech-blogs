import type { Field } from 'payload'

export interface SeoFieldOptions {
  name?: string
  label?: string
}

/**
 * Reusable SEO metadata field group conforming to modern search engine and OpenGraph standards.
 */
export const seoField = ({
  name = 'seo',
  label = 'Search Engine Optimization (SEO)',
}: SeoFieldOptions = {}): Field => ({
  name,
  label,
  type: 'group',
  admin: {
    description: 'Manage search engine metadata and social preview appearance.',
  },
  fields: [
    {
      name: 'metaTitle',
      label: 'Meta Title',
      type: 'text',
      maxLength: 70,
      admin: {
        description: 'Recommended: 50–60 characters (max 70).',
      },
    },
    {
      name: 'metaDescription',
      label: 'Meta Description',
      type: 'textarea',
      maxLength: 160,
      admin: {
        description: 'Recommended: 120–160 characters for optimal search snippet display.',
      },
    },
    {
      name: 'ogImage',
      label: 'Social Share Image (Open Graph)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optimal dimensions: 1200x630 (1.91:1) or 1200x675 (16:9).',
      },
    },
    {
      name: 'canonicalUrl',
      label: 'Canonical URL',
      type: 'text',
      admin: {
        description: 'Optional override for the canonical URL if republished from another source.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'noIndex',
          label: 'No Index',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Instruct search crawlers NOT to index this page in search results.',
            width: '50%',
          },
        },
        {
          name: 'noFollow',
          label: 'No Follow',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Instruct search crawlers NOT to follow hyperlinks on this page.',
            width: '50%',
          },
        },
      ],
    },
  ],
})

