import type { Access } from 'payload'
import { isEditor } from '@/access/isEditor'
import { publishedOnly } from '@/access/publishedOnly'
import { isAuthor } from '@/access/isAuthor'

export const coursesAccess = {
  read: publishedOnly,
  create: isAuthor,
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin' || user.role === 'editor') return true

    // Authors can update their own courses
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
