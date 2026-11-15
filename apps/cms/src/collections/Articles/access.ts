import type { Access, FieldAccess } from 'payload'
import { publishedOnly } from '@/access/publishedOnly'
import { isAuthor } from '@/access/isAuthor'
import { isEditor } from '@/access/isEditor'

export const articlesAccess = {
  read: publishedOnly,
  create: isAuthor,
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin' || user.role === 'editor') return true

    // Authors can update their own articles
    const authorProfileId = typeof user.authorProfile === 'object' && user.authorProfile !== null
      ? (user.authorProfile as { id: string | number }).id
      : user.authorProfile

    if (authorProfileId) {
      return {
        author: {
          equals: authorProfileId,
        },
      }
    }
    return false
  },
  delete: isEditor,
} satisfies { [key: string]: Access }

/**
 * Ensures only Administrators and Editors can change the publication status or publish directly.
 */
export const publishFieldAccess: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && (user.role === 'admin' || user.role === 'editor'))
}
