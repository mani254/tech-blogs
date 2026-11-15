import type {
  Article,
  Course,
  Media,
  Author,
  Category,
  Tag,
  SiteSetting,
} from '@org/shared'

// Re-export generated core types directly
export type { Article, Course, Media, Author, Category, Tag, SiteSetting }

// Extract section and block types directly from the generated Article definition
export type ArticleSection = NonNullable<Article['sections']>[number]
export type ArticleBlock = ArticleSection['content'][number]
export type ArticleBlockType = ArticleBlock['blockType']

// Exact discriminated block types derived directly from Article
export type ExtractBlock<T extends ArticleBlockType> = Extract<ArticleBlock, { blockType: T }>

export type RichTextBlockData = ExtractBlock<'richText'>
export type CodeBlockData = ExtractBlock<'code'>
export type ImageBlockData = ExtractBlock<'image'>
export type VideoBlockData = ExtractBlock<'video'>
export type TableBlockData = ExtractBlock<'table'>
export type CalloutBlockData = ExtractBlock<'callout'>
export type QuoteBlockData = ExtractBlock<'quote'>
export type EmbedBlockData = ExtractBlock<'embed'>
export type RelatedArticlesBlockData = ExtractBlock<'relatedArticles'>
export type ListBlockData = ExtractBlock<'list'>

