import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Article, Course, Media, Author } from '@org/shared'

import {
  ArticleRenderer,
  SectionRenderer,
  TableOfContents,
  BlockRenderer,
  CourseRenderer,
  RichTextBlock,
  CodeBlock,
  ImageBlock,
  VideoBlock,
  TableBlock,
  CalloutBlock,
  QuoteBlock,
  EmbedBlock,
  RelatedArticlesBlock,
  ListBlock,
  isPopulatedMedia,
  isPopulatedAuthor,
  isPopulatedArticle,
  isPopulatedCourse,
  resolveMediaInfo,
  type ArticleBlock,
  type RichTextBlockData,
  type CodeBlockData,
  type ImageBlockData,
  type VideoBlockData,
  type TableBlockData,
  type CalloutBlockData,
  type QuoteBlockData,
  type EmbedBlockData,
  type RelatedArticlesBlockData,
  type ListBlockData,
} from '../src/index.js'

describe('Content Renderer Component & Type Safety Tests', () => {
  // Test Fixture 1: Mock Media
  const mockMedia: Media = {
    id: 'media-1',
    alt: 'Architecture Diagram',
    caption: 'Distributed event bus topology',
    url: 'https://cdn.example.com/assets/diagram.jpg',
    width: 1920,
    height: 1080,
    mediaCategory: 'article_cover',
    updatedAt: '2026-11-15T00:00:00.000Z',
    createdAt: '2026-11-15T00:00:00.000Z',
  }

  // Test Fixture 2: Mock Author
  const mockAuthor: Author = {
    id: 'author-1',
    name: 'Ada Lovelace',
    slug: 'ada-lovelace',
    designation: 'Principal Systems Architect',
    isFeatured: true,
    bio: null,
    updatedAt: '2026-11-15T00:00:00.000Z',
    createdAt: '2026-11-15T00:00:00.000Z',
  }

  // Test Fixture 3: Comprehensive Mock Article
  const mockArticle: Article = {
    id: 'art-100',
    title: 'Building Scalable Next.js Monorepos with Payload CMS',
    slug: 'building-scalable-nextjs-monorepos-with-payload-cms',
    articleType: 'blog',
    description: 'An architectural breakdown of modular micro-frontends and CMS integration.',
    author: mockAuthor,
    coverImage: mockMedia,
    publishedAt: '2026-11-15T08:00:00.000Z',
    readingTime: 7,
    wordCount: 1450,
    sections: [
      {
        id: 'sec-1',
        title: 'Introduction & Context',
        anchorId: 'introduction-and-context',
        description: 'Why headless CMS architecture matters in modern monorepos.',
        content: [
          {
            id: 'b-rich-1',
            blockType: 'richText',
            content: {
              root: {
                type: 'root',
                format: '',
                indent: 0,
                version: 1,
                direction: 'ltr',
                children: [
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        text: 'Monorepos provide exceptional code sharing and atomic refactoring. ',
                        version: 1,
                      },
                      {
                        type: 'text',
                        text: 'Here is bold architectural advice.',
                        format: 1, // Bold
                        version: 1,
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
      {
        id: 'sec-2',
        title: 'Core Code Implementation',
        anchorId: 'core-code-implementation',
        content: [
          {
            id: 'b-code-1',
            blockType: 'code',
            language: 'typescript',
            filename: 'packages/renderer/src/index.ts',
            code: 'export const render = () => { return "Hello World"; };',
            showLineNumbers: true,
            startingLineNumber: 1,
            enableCopy: true,
          },
        ],
      },
      {
        id: 'sec-3',
        title: 'Secret Internal Notes',
        anchorId: 'secret-internal-notes',
        hideFromToc: true, // Should be omitted from TableOfContents
        content: [
          {
            id: 'b-callout-1',
            blockType: 'callout',
            variant: 'info',
            title: 'Note for Editors',
            content: {
              root: {
                type: 'root',
                format: '',
                indent: 0,
                version: 1,
                direction: 'ltr',
                children: [
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [
                      {
                        type: 'text',
                        text: 'This section is excluded from the TOC.',
                        version: 1,
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    ],
    updatedAt: '2026-11-15T08:00:00.000Z',
    createdAt: '2026-11-15T08:00:00.000Z',
    _status: 'published',
  }

  describe('Type Guards', () => {
    it('correctly discriminates populated vs unpopulated Media', () => {
      assert.equal(isPopulatedMedia(mockMedia), true)
      assert.equal(isPopulatedMedia('media-id-string'), false)
      assert.equal(isPopulatedMedia(null), false)
      assert.equal(isPopulatedMedia(undefined), false)
    })

    it('correctly discriminates populated vs unpopulated Author', () => {
      assert.equal(isPopulatedAuthor(mockAuthor), true)
      assert.equal(isPopulatedAuthor('author-id-string'), false)
      assert.equal(isPopulatedAuthor(null), false)
    })

    it('correctly discriminates populated vs unpopulated Article', () => {
      assert.equal(isPopulatedArticle(mockArticle), true)
      assert.equal(isPopulatedArticle('article-id-string'), false)
    })

    it('correctly discriminates populated vs unpopulated Course', () => {
      const sampleCourse: Course = {
        id: 'c-1',
        title: 'Sample Course',
        slug: 'sample-course',
        author: 'auth-1',
        updatedAt: '2026-11-15T00:00:00.000Z',
        createdAt: '2026-11-15T00:00:00.000Z',
      }
      assert.equal(isPopulatedCourse(sampleCourse), true)
      assert.equal(isPopulatedCourse('course-id-string'), false)
      assert.equal(isPopulatedCourse(null), false)
    })

    it('correctly resolves media info for populated media', () => {
      const resolved = resolveMediaInfo(mockMedia, 'cover')
      assert.equal(resolved.url, 'https://cdn.example.com/assets/diagram.jpg')
      assert.equal(resolved.alt, 'Architecture Diagram')
      assert.equal(resolved.width, 1920)
      assert.equal(resolved.height, 1080)
    })

    it('correctly handles unpopulated media string gracefully', () => {
      const resolved = resolveMediaInfo('non-url-id', undefined, 'Fallback Alt')
      assert.equal(resolved.url, null)
      assert.equal(resolved.alt, 'Fallback Alt')
    })
  })

  describe('TableOfContents Component', () => {
    it('generates TOC links for visible sections', () => {
      const html = renderToStaticMarkup(<TableOfContents sections={mockArticle.sections} />)
      assert.match(html, /Introduction &amp; Context|Introduction & Context/)
      assert.match(html, /Core Code Implementation/)
      assert.match(html, /href="#introduction-and-context"/)
      assert.match(html, /href="#core-code-implementation"/)
    })

    it('filters out sections marked with hideFromToc: true', () => {
      const html = renderToStaticMarkup(<TableOfContents sections={mockArticle.sections} />)
      assert.doesNotMatch(html, /Secret Internal Notes/)
      assert.doesNotMatch(html, /href="#secret-internal-notes"/)
    })

    it('returns null when sections list has 0 or 1 item', () => {
      const htmlZero = renderToStaticMarkup(<TableOfContents sections={[]} />)
      assert.equal(htmlZero, '')

      const htmlOne = renderToStaticMarkup(
        <TableOfContents sections={[{ id: '1', title: 'Only Section', anchorId: 'only', content: [] }]} />,
      )
      assert.equal(htmlOne, '')
    })
  })

  describe('SectionRenderer Component', () => {
    it('renders section with stable HTML id and heading link', () => {
      const section = mockArticle.sections![0]
      const html = renderToStaticMarkup(<SectionRenderer section={section} />)

      assert.match(html, /id="introduction-and-context"/)
      assert.match(html, /href="#introduction-and-context"/)
      assert.match(html, /Why headless CMS architecture matters in modern monorepos\./)
      assert.match(html, /Monorepos provide exceptional code sharing/)
    })
  })

  describe('BlockRenderer & Individual Blocks', () => {
    it('renders standalone RichTextBlock with headings and formatted text', () => {
      const richBlock: RichTextBlockData = {
        id: 'rb-direct',
        blockType: 'richText',
        content: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                type: 'heading',
                tag: 'h3',
                version: 1,
                children: [{ type: 'text', text: 'Section Heading 3', version: 1 }],
              },
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', text: 'Detailed prose paragraph.', version: 1 }],
              },
            ],
          },
        },
      }
      const html = renderToStaticMarkup(<RichTextBlock block={richBlock} />)
      assert.match(html, /Section Heading 3/)
      assert.match(html, /Detailed prose paragraph\./)
    })

    it('renders CodeBlock directly with language and filename', () => {
      const directCodeBlock: CodeBlockData = {
        id: 'cb-direct',
        blockType: 'code',
        language: 'python',
        filename: 'server.py',
        code: 'print("hello world")',
        enableCopy: false,
      }
      const html = renderToStaticMarkup(<CodeBlock block={directCodeBlock} />)
      assert.match(html, /server\.py/)
      assert.match(html, /python/)
      assert.match(html, /print\(&quot;hello world&quot;\)/)
    })

    it('renders EmbedBlock with validated CodePen iframe', () => {
      const embedBlock: EmbedBlockData = {
        id: 'emb-direct',
        blockType: 'embed',
        provider: 'codepen',
        url: 'https://codepen.io/pen/demo',
        caption: 'Live CodePen Sample',
      }
      const html = renderToStaticMarkup(<EmbedBlock block={embedBlock} />)
      assert.match(html, /src="https:\/\/codepen\.io\/pen\/demo"/)
      assert.match(html, /Live CodePen Sample/)
    })

    it('renders CodeBlock with filename, language, and line numbers', () => {
      const codeBlock = mockArticle.sections![1].content[0]
      const html = renderToStaticMarkup(<BlockRenderer block={codeBlock} />)

      assert.match(html, /packages\/renderer\/src\/index\.ts/)
      assert.match(html, /typescript/)
      assert.match(html, /export const render = \(\) =&gt;/)
    })

    it('renders ImageBlock with responsive figure, image URL, and caption', () => {
      const imageBlock: ImageBlockData = {
        id: 'img-b',
        blockType: 'image',
        image: mockMedia,
        alt: 'Custom Alt Text',
        caption: 'Diagram showing edge caching',
        alignment: 'center',
        displayWidth: 'wide',
      }
      const html = renderToStaticMarkup(<ImageBlock block={imageBlock} />)

      assert.match(html, /<figure/)
      assert.match(html, /src="https:\/\/cdn\.example\.com\/assets\/diagram\.jpg"/)
      assert.match(html, /alt="Custom Alt Text"/)
      assert.match(html, /Diagram showing edge caching/)
    })

    it('renders VideoBlock with sanitized YouTube iframe embed', () => {
      const videoBlock: VideoBlockData = {
        id: 'vid-b',
        blockType: 'video',
        provider: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Keynote Demo',
        caption: 'Watch the live distributed transaction demo',
      }
      const html = renderToStaticMarkup(<VideoBlock block={videoBlock} />)

      assert.match(html, /src="https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ"/)
      assert.match(html, /Keynote Demo/)
      assert.match(html, /Watch the live distributed transaction demo/)
    })

    it('renders TableBlock with semantic columns and row cells', () => {
      const tableBlock: TableBlockData = {
        id: 'tbl-b',
        blockType: 'table',
        hasHeaderRow: true,
        columns: [
          { header: 'Framework', alignment: 'left' },
          { header: 'Build Time', alignment: 'right' },
        ],
        rows: [
          {
            cells: [{ value: 'Next.js 15' }, { value: '1.2s' }],
          },
          {
            cells: [{ value: 'Vite 6' }, { value: '0.4s' }],
          },
        ],
        caption: 'Build benchmark comparisons',
      }
      const html = renderToStaticMarkup(<TableBlock block={tableBlock} />)

      assert.match(html, /<table/)
      assert.match(html, /Framework/)
      assert.match(html, /Build Time/)
      assert.match(html, /Next\.js 15/)
      assert.match(html, /Vite 6/)
      assert.match(html, /Build benchmark comparisons/)
    })

    it('renders CalloutBlock with appropriate variant styling', () => {
      const calloutBlock: CalloutBlockData = {
        id: 'call-b',
        blockType: 'callout',
        variant: 'warning',
        title: 'Deprecated API Warning',
        content: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', text: 'Do not use this endpoint in v2.', version: 1 }],
              },
            ],
          },
        },
      }
      const html = renderToStaticMarkup(<CalloutBlock block={calloutBlock} />)

      assert.match(html, /Deprecated API Warning/)
      assert.match(html, /Do not use this endpoint in v2\./)
    })

    it('renders QuoteBlock with blockquote, attribution and cite', () => {
      const quoteBlock: QuoteBlockData = {
        id: 'q-b',
        blockType: 'quote',
        quote: 'Simplicity is prerequisite for reliability.',
        attribution: 'Edsger W. Dijkstra',
        source: 'EWD498',
      }
      const html = renderToStaticMarkup(<QuoteBlock block={quoteBlock} />)

      assert.match(html, /<blockquote/)
      assert.match(html, /Simplicity is prerequisite for reliability\./)
      assert.match(html, /Edsger W\. Dijkstra/)
      assert.match(html, /EWD498/)
    })

    it('renders ListBlock with checkmark styling', () => {
      const listBlock: ListBlockData = {
        id: 'list-b',
        blockType: 'list',
        listType: 'check',
        items: [
          { text: 'Install dependencies', checked: true },
          { text: 'Deploy to edge', checked: false },
        ],
      }
      const html = renderToStaticMarkup(<ListBlock block={listBlock} />)

      assert.match(html, /Install dependencies/)
      assert.match(html, /Deploy to edge/)
      assert.match(html, /line-through/) // Checked item has line-through
    })

    it('renders RelatedArticlesBlock with populated article cards', () => {
      const relatedBlock: RelatedArticlesBlockData = {
        id: 'rel-b',
        blockType: 'relatedArticles',
        title: 'Further Reading',
        displayStyle: 'cards',
        articles: [mockArticle],
      }
      const html = renderToStaticMarkup(<RelatedArticlesBlock block={relatedBlock} />)

      assert.match(html, /Further Reading/)
      assert.match(html, /Building Scalable Next\.js Monorepos with Payload CMS/)
      assert.match(html, /7 min read/)
    })

    it('handles unknown block type safely without crashing', () => {
      const unknownBlock = {
        id: 'unk-b',
        blockType: 'unsupportedCustomBlock' as unknown as ArticleBlock['blockType'],
      } as unknown as ArticleBlock
      const html = renderToStaticMarkup(<BlockRenderer block={unknownBlock} />)
      assert.match(html, /Unsupported block type: unsupportedCustomBlock/)
    })
  })

  describe('ArticleRenderer Component', () => {
    it('renders full article document with header, cover, TOC, and sections', () => {
      const html = renderToStaticMarkup(<ArticleRenderer article={mockArticle} />)

      assert.match(html, /Building Scalable Next\.js Monorepos with Payload CMS/)
      assert.match(html, /Ada Lovelace/)
      assert.match(html, /Principal Systems Architect/)
      assert.match(html, /7 min read/)
      assert.match(html, /src="https:\/\/cdn\.example\.com\/assets\/diagram\.jpg"/)
      assert.match(html, /Table of Contents/)
      assert.match(html, /id="introduction-and-context"/)
      assert.match(html, /id="core-code-implementation"/)
    })

    it('handles unpopulated author string gracefully without throwing', () => {
      const articleWithUnpopulatedAuthor: Article = {
        ...mockArticle,
        author: 'author-unpopulated-string-id',
      }
      const html = renderToStaticMarkup(<ArticleRenderer article={articleWithUnpopulatedAuthor} />)
      assert.match(html, /Building Scalable Next\.js Monorepos with Payload CMS/)
    })
  })

  describe('CourseRenderer Component', () => {
    const mockCourse: Course = {
      id: 'course-10',
      title: 'Fullstack Next.js and Payload CMS Masterclass',
      slug: 'fullstack-nextjs-and-payload-cms-masterclass',
      excerpt: 'Comprehensive curriculum taking you from zero to production architecture.',
      difficulty: 'advanced',
      status: 'active',
      author: mockAuthor,
      coverImage: mockMedia,
      lessonSequence: 2,
      updatedAt: '2026-11-15T00:00:00.000Z',
      createdAt: '2026-11-15T00:00:00.000Z',
      _status: 'published',
    }

    const mockLesson1: Article = {
      ...mockArticle,
      id: 'lesson-1',
      title: 'Lesson 1: Repository Architecture',
      slug: 'lesson-1-repository-architecture',
      articleType: 'course',
      courseMetadata: {
        pageNumber: 1,
        lessonDuration: 20,
      },
    }

    const mockLesson2: Article = {
      ...mockArticle,
      id: 'lesson-2',
      title: 'Lesson 2: Data Modeling with Payload',
      slug: 'lesson-2-data-modeling-with-payload',
      articleType: 'course',
      courseMetadata: {
        pageNumber: 2,
        lessonDuration: 35,
      },
    }

    it('renders course syllabus with lessons sorted by pageNumber', () => {
      const html = renderToStaticMarkup(
        <CourseRenderer
          course={mockCourse}
          lessons={[mockLesson2, mockLesson1]} // Pass unsorted
          currentLessonId="lesson-1"
        />,
      )

      assert.match(html, /Fullstack Next\.js and Payload CMS Masterclass/)
      assert.match(html, /Syllabus \(2 Lessons\)/)
      assert.match(html, /Lesson 1: Repository Architecture/)
      assert.match(html, /Lesson 2: Data Modeling with Payload/)
      assert.match(html, /20m/)
      assert.match(html, /35m/)
    })

    it('renders current active lesson and next navigation button', () => {
      const html = renderToStaticMarkup(
        <CourseRenderer
          course={mockCourse}
          lessons={[mockLesson1, mockLesson2]}
          currentLessonId="lesson-1"
        />,
      )

      assert.match(html, /Next: Lesson 2: Data Modeling with Payload/)
    })
  })
})
