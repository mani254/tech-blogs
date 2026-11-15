import type { Access } from 'payload'
import { anyone } from '@/access/anyone'
import { isEditor } from '@/access/isEditor'

export const authorsAccess = {
  read: anyone,
  create: isEditor,
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin' || user.role === 'editor') return true
    // Author can update their own author profile if linked
    return {
      linkedUser: {
        equals: user.id,
      },
    }
  },
  delete: isEditor,
} satisfies { [key: string]: Access }
