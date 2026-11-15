import type { Access, Where } from 'payload'

/**
 * Access control function restricting read queries to published content for public visitors.
 * - Administrators and Editors can read all content (including drafts and archived records).
 * - Authors can read all published content plus their own drafts.
 * - Unauthenticated / Public visitors can ONLY read published content.
 */
export const publishedOnly: Access = ({ req: { user } }) => {
  if (user?.role === 'admin' || user?.role === 'editor') {
    return true
  }

  // If the user is an author linked to an author profile, allow reading published + their own drafts
  const authorProfileId = typeof user?.authorProfile === 'object' && user?.authorProfile !== null
    ? (user.authorProfile as { id: string | number }).id
    : user?.authorProfile

  if (authorProfileId) {
    const publishedCondition: Where = {
      _status: {
        equals: 'published',
      },
    }
    const authorCondition: Where = {
      author: {
        equals: authorProfileId,
      },
    }
    const query: Where = {
      or: [publishedCondition, authorCondition],
    }
    return query
  }

  // Public / anonymous visitors can only access published documents
  const query: Where = {
    _status: {
      equals: 'published',
    },
  }
  return query
}
