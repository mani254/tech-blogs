import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { tagsAccess } from './access'
import { tagsHooks } from './hooks'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'isActive', 'updatedAt'],
    group: 'Taxonomies',
  },
  access: tagsAccess,
  hooks: tagsHooks,
  fields: [
    {
      name: 'name',
      label: 'Tag Name',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'description',
      label: 'Tag Description',
      type: 'textarea',
      admin: {
        description: 'Optional summary describing articles annotated with this tag.',
      },
    },
    {
      name: 'isActive',
      label: 'Active Tag',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

