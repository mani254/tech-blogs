import type { CollectionConfig } from 'payload'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { categoriesAccess } from './access'
import { categoriesHooks } from './hooks'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'isActive', 'updatedAt'],
    group: 'Taxonomies',
  },
  access: categoriesAccess,
  hooks: categoriesHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Category Details',
          fields: [
            {
              name: 'name',
              label: 'Category Name',
              type: 'text',
              required: true,
            },
            slugField({ fieldToUse: 'name' }),
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              admin: {
                description: 'Comprehensive description explaining topics encompassed by this category.',
              },
            },
            {
              name: 'parent',
              label: 'Parent Category',
              type: 'relationship',
              relationTo: 'categories',
              index: true,
              admin: {
                description: 'Optional parent category for hierarchical content grouping.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            seoField({
              name: 'seo',
              label: 'Category SEO',
            }),
          ],
        },
      ],
    },
    {
      name: 'isActive',
      label: 'Active Category',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Inactive categories are hidden from public navigation filters.',
      },
    },
  ],
  timestamps: true,
}
