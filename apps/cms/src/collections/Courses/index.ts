import type { CollectionConfig } from 'payload'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { coursesAccess } from './access'
import { coursesHooks } from './hooks'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'difficulty', 'status', '_status', 'updatedAt'],
    group: 'Educational Content',
  },
  versions: {
    drafts: true,
  },
  access: coursesAccess,
  hooks: coursesHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Course Overview',
          fields: [
            {
              name: 'title',
              label: 'Course Title',
              type: 'text',
              required: true,
            },
            slugField({ fieldToUse: 'title' }),
            {
              name: 'excerpt',
              label: 'Short Summary / Excerpt',
              type: 'textarea',
              admin: {
                description: 'Brief overview displayed in course cards and search previews.',
              },
            },
            {
              name: 'description',
              label: 'Full Course Description & Syllabus',
              type: 'richText',
              admin: {
                description: 'Detailed syllabus, prerequisites, and learning outcomes.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'difficulty',
                  label: 'Difficulty Level',
                  type: 'select',
                  defaultValue: 'intermediate',
                  options: [
                    { label: 'Beginner', value: 'beginner' },
                    { label: 'Intermediate', value: 'intermediate' },
                    { label: 'Advanced', value: 'advanced' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'status',
                  label: 'Course Lifecycle Status',
                  type: 'select',
                  defaultValue: 'active',
                  options: [
                    { label: 'Planned / Upcoming', value: 'planned' },
                    { label: 'Active / In Progress', value: 'active' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Archived', value: 'archived' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'coverImage',
                  label: 'Course Cover Banner (16:9)',
                  type: 'upload',
                  relationTo: 'media',
                  index: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'thumbnail',
                  label: 'Course Thumbnail',
                  type: 'upload',
                  relationTo: 'media',
                  index: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Instructors & Taxonomy',
          fields: [
            {
              name: 'author',
              label: 'Lead Instructor / Author',
              type: 'relationship',
              relationTo: 'authors',
              required: true,
              index: true,
              admin: {
                description: 'Lead instructor or credited author responsible for the curriculum.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'categories',
                  label: 'Categories',
                  type: 'relationship',
                  relationTo: 'categories',
                  hasMany: true,
                  index: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'tags',
                  label: 'Tags',
                  type: 'relationship',
                  relationTo: 'tags',
                  hasMany: true,
                  index: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            seoField({
              name: 'seo',
              label: 'Course SEO Metadata',
            }),
          ],
        },
      ],
    },
    {
      name: 'lessonSequence',
      label: 'Lesson Sequence Counter (Internal)',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Concurrency-safe atomic sequence tracker for published course lessons.',
      },
    },
  ],
  timestamps: true,
}
