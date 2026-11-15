import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { socialLinksField } from '@/fields/reusable'
import { authorsAccess } from './access'
import { authorsHooks } from './hooks'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'designation', 'linkedUser', 'isFeatured', 'createdAt'],
    group: 'Editorial & People',
  },
  access: authorsAccess,
  hooks: authorsHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile Information',
          fields: [
            {
              name: 'name',
              label: 'Author Name',
              type: 'text',
              required: true,
            },
            slugField({ fieldToUse: 'name' }),
            {
              type: 'row',
              fields: [
                {
                  name: 'designation',
                  label: 'Professional Designation',
                  type: 'text',
                  admin: {
                    width: '60%',
                    placeholder: 'e.g. Principal Distributed Systems Engineer',
                  },
                },
                {
                  name: 'isFeatured',
                  label: 'Featured Author',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '40%',
                    description: 'Highlight author on public editorial pages.',
                  },
                },
              ],
            },
            {
              name: 'profileImage',
              label: 'Profile Photo',
              type: 'upload',
              relationTo: 'media',
              index: true,
              admin: {
                description: 'Author avatar photo displayed on articles and public profile.',
              },
            },
            {
              name: 'bio',
              label: 'Author Biography',
              type: 'richText',
              admin: {
                description: 'Full markdown / rich text biography detailing experience and background.',
              },
            },
          ],
        },
        {
          label: 'Social Profiles',
          fields: [socialLinksField],
        },
      ],
    },
    {
      name: 'linkedUser',
      label: 'Linked CMS Account',
      type: 'relationship',
      relationTo: 'users',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Connect this public author profile to an authenticated CMS user account.',
      },
    },
  ],
  timestamps: true,
}
