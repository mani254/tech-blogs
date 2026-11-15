import type {
  Media,
  Author,
  Article,
  Course,
  Category,
  Tag,
} from '../types.js'

/**
 * Type guard checking if a Media relationship is populated with an object rather than a string ID.
 */
export function isPopulatedMedia(media: unknown): media is Media {
  return (
    typeof media === 'object' &&
    media !== null &&
    'url' in media &&
    typeof (media as Media).url === 'string'
  )
}

/**
 * Type guard checking if an Author relationship is populated.
 */
export function isPopulatedAuthor(author: unknown): author is Author {
  return (
    typeof author === 'object' &&
    author !== null &&
    'name' in author &&
    typeof (author as Author).name === 'string'
  )
}

/**
 * Type guard checking if an Article relationship is populated.
 */
export function isPopulatedArticle(article: unknown): article is Article {
  return (
    typeof article === 'object' &&
    article !== null &&
    'title' in article &&
    typeof (article as Article).title === 'string'
  )
}

/**
 * Type guard checking if a Course relationship is populated.
 */
export function isPopulatedCourse(course: unknown): course is Course {
  return (
    typeof course === 'object' &&
    course !== null &&
    'title' in course &&
    typeof (course as Course).title === 'string'
  )
}

/**
 * Type guard checking if a Category relationship is populated.
 */
export function isPopulatedCategory(category: unknown): category is Category {
  return (
    typeof category === 'object' &&
    category !== null &&
    'name' in category &&
    typeof (category as Category).name === 'string'
  )
}

/**
 * Type guard checking if a Tag relationship is populated.
 */
export function isPopulatedTag(tag: unknown): tag is Tag {
  return (
    typeof tag === 'object' &&
    tag !== null &&
    'name' in tag &&
    typeof (tag as Tag).name === 'string'
  )
}

