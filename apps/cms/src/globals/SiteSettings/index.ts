import type { GlobalConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/isAdmin'
import { seoField } from '@/fields/seo'
import { socialLinksField } from '@/fields/reusable'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Platform Configuration',
  },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General Information',
          fields: [
            {
              name: 'websiteName',
              label: 'Website Name',
              type: 'text',
              required: true,
              defaultValue: 'Tech Blogs Platform',
            },
            {
              name: 'websiteDescription',
              label: 'Website Description / Tagline',
              type: 'textarea',
              defaultValue: 'High-performance technical blogging, engineering deep dives, tutorials and programming courses.',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactEmail',
                  label: 'Official Contact Email',
                  type: 'email',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'defaultLanguage',
                  label: 'Default Language Code',
                  type: 'select',
                  defaultValue: 'en',
                  options: [
                    { label: 'English (en)', value: 'en' },
                    { label: 'Spanish (es)', value: 'es' },
                    { label: 'German (de)', value: 'de' },
                    { label: 'French (fr)', value: 'fr' },
                    { label: 'Japanese (ja)', value: 'ja' },
                  ],
                  admin: {
                    width: '25%',
                  },
                },
                {
                  name: 'timezone',
                  label: 'Default Timezone',
                  type: 'text',
                  defaultValue: 'UTC',
                  admin: {
                    width: '25%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  label: 'Primary Website Logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'favicon',
                  label: 'Favicon Icon',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Social Profiles',
          fields: [socialLinksField],
        },
        {
          label: 'Default SEO',
          fields: [
            seoField({
              name: 'defaultSeo',
              label: 'Fallback Site-wide SEO',
            }),
          ],
        },
      ],
    },
  ],
}

