import type { CollectionConfig } from 'payload'
import { articleBlocks } from '@/blocks'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { articlesAccess } from './access'
import { articlesHooks } from './hooks'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'articleType', 'author', '_status', 'publishedAt', 'updatedAt'],
    group: 'Editorial Content',
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  access: articlesAccess,
  hooks: articlesHooks,
  indexes: [
    {
      fields: ['articleType'],
    },
  ],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              label: 'Article Title',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'e.g. Architecting Distributed Systems with Next.js and Payload CMS',
              },
            },
            slugField({ fieldToUse: 'title' }),
            {
              name: 'articleType',
              label: 'Article Classification',
              type: 'select',
              required: true,
              defaultValue: 'blog',
              options: [
                { label: 'Blog Article (Technical Analysis, Guides & Insights)', value: 'blog' },
                { label: 'News Item (Announcements, Releases & Updates)', value: 'news' },
                { label: 'Course Lesson (Modular Chapter of a Learning Course)', value: 'course' },
              ],
              admin: {
                description: 'Dictates editorial workflow, conditional metadata, and course lesson numbering.',
              },
            },
            {
              name: 'description',
              label: 'Summary / Excerpt',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Short summary for search results, RSS feeds, and article card previews.',
              },
            },
            {
              name: 'coverImage',
              label: 'Cover Image (16:9 Minimum 1200x675)',
              type: 'upload',
              relationTo: 'media',
              index: true,
              admin: {
                description: 'Hero banner displayed on article headers and listing cards. MUST adhere to a 16:9 aspect ratio (min 1200x675).',
              },
            },
            {
              name: 'sections',
              label: 'Article Sections (Modular Content)',
              type: 'array',
              minRows: 1,
              labels: {
                singular: 'Section',
                plural: 'Sections',
              },
              admin: {
                description: 'Organize your article into distinct navigable sections. Each section can hold multiple content blocks and automatically forms the Table of Contents.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Section Heading',
                      type: 'text',
                      required: true,
                      admin: {
                        width: '50%',
                        placeholder: 'e.g. Understanding Event-Driven Architecture',
                      },
                    },
                    {
                      name: 'anchorId',
                      label: 'Anchor ID (TOC Link)',
                      type: 'text',
                      required: true,
                      admin: {
                        width: '35%',
                        description: 'Stable URL hash anchor (#anchor-id). Auto-generated from title.',
                      },
                    },
                    {
                      name: 'hideFromToc',
                      label: 'Hide from TOC',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        width: '15%',
                        description: 'Exclude heading from Table of Contents.',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  label: 'Section Subheading / Description',
                  type: 'textarea',
                  admin: {
                    description: 'Optional introductory summary for this specific section.',
                  },
                },
                {
                  name: 'content',
                  label: 'Section Content Blocks',
                  type: 'blocks',
                  required: true,
                  blocks: articleBlocks,
                },
              ],
            },
          ],
        },
        {
          label: 'Organization',
          fields: [
            {
              name: 'author',
              label: 'Primary Author',
              type: 'relationship',
              relationTo: 'authors',
              required: true,
              index: true,
              admin: {
                description: 'Credited author for this article.',
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
            {
              name: 'relatedArticles',
              label: 'Recommended / Related Articles',
              type: 'relationship',
              relationTo: 'articles',
              hasMany: true,
              admin: {
                description: 'Select curated articles to recommend at the end of this article.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'isFeatured',
                  label: 'Featured Article (Promote to Hero/Top Slots)',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'isPinned',
                  label: 'Pinned Article (Fix to Top of Category/List)',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Classification Details',
          fields: [
            // NEWS-SPECIFIC METADATA
            {
              name: 'newsMetadata',
              label: 'News Specifics',
              type: 'group',
              admin: {
                condition: (data) => data?.articleType === 'news',
                description: 'Fields specific to news reports, press releases, and announcements.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'sourceName',
                      label: 'Original News Source',
                      type: 'text',
                      admin: {
                        width: '50%',
                        placeholder: 'e.g. Reuters, TechCrunch, Official Press Release',
                      },
                    },
                    {
                      name: 'sourceUrl',
                      label: 'Original Source URL',
                      type: 'text',
                      admin: {
                        width: '50%',
                        placeholder: 'https://...',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'eventDate',
                      label: 'Date of Reported Event',
                      type: 'date',
                      admin: {
                        width: '40%',
                      },
                    },
                    {
                      name: 'location',
                      label: 'Event Location / Dateline',
                      type: 'text',
                      admin: {
                        width: '40%',
                        placeholder: 'e.g. San Francisco, CA',
                      },
                    },
                    {
                      name: 'isBreaking',
                      label: 'Breaking News Banner',
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
            // COURSE-SPECIFIC METADATA
            {
              name: 'courseMetadata',
              label: 'Course Lesson Specifics',
              type: 'group',
              admin: {
                condition: (data) => data?.articleType === 'course',
                description: 'Fields specific to course lessons, chapters, and curriculum sequencing.',
              },
              fields: [
                {
                  name: 'course',
                  label: 'Parent Course',
                  type: 'relationship',
                  relationTo: 'courses',
                  index: true,
                  admin: {
                    description: 'Select the parent course curriculum this lesson belongs to (required for publishing).',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'pageNumber',
                      label: 'Lesson Sequence / Page Number',
                      type: 'number',
                      admin: {
                        width: '50%',
                        readOnly: true,
                        description: 'Automatically allocated sequentially upon first publication. Immutable once published.',
                      },
                    },
                    {
                      name: 'lessonDuration',
                      label: 'Estimated Lesson Duration (Minutes)',
                      type: 'number',
                      admin: {
                        width: '50%',
                        placeholder: 'e.g. 15',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Publishing & Metrics',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'readingTime',
                  label: 'Estimated Reading Time (Minutes)',
                  type: 'number',
                  admin: {
                    width: '25%',
                    readOnly: true,
                    description: 'Calculated automatically (~200 wpm, excluding code snippets).',
                  },
                },
                {
                  name: 'wordCount',
                  label: 'Total Human Word Count',
                  type: 'number',
                  admin: {
                    width: '25%',
                    readOnly: true,
                    description: 'Calculated automatically from section prose.',
                  },
                },
                {
                  name: 'publishedAt',
                  label: 'First Published Date',
                  type: 'date',
                  admin: {
                    width: '25%',
                    readOnly: true,
                    description: 'Timestamp when article was first published to the public.',
                  },
                },
                {
                  name: 'lastContentUpdatedAt',
                  label: 'Last Content Update',
                  type: 'date',
                  admin: {
                    width: '25%',
                    readOnly: true,
                    description: 'Timestamp of the most recent editorial content revision.',
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
              label: 'Article SEO & Social Preview',
            }),
          ],
        },
      ],
    },
    // Top-level aliases for course and pageNumber to facilitate indexing and direct API querying
    {
      name: 'course',
      label: 'Parent Course',
      type: 'relationship',
      relationTo: 'courses',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data, siblingData }) => {
            return siblingData?.courseMetadata?.course || data?.course
          },
        ],
      },
    },
    {
      name: 'pageNumber',
      label: 'Course Page Number',
      type: 'number',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data, siblingData }) => {
            return siblingData?.courseMetadata?.pageNumber ?? data?.pageNumber
          },
        ],
      },
    },
  ],
  timestamps: true,
}
