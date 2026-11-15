import type { Access } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const mediaAccess = {
  read: anyone,
  create: authenticated,
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin' || user.role === 'editor') return true
    return {
      uploadedBy: {
        equals: user.id,
      },
    }
  },
  delete: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin' || user.role === 'editor') return true
    return {
      uploadedBy: {
        equals: user.id,
      },
    }
  },
} satisfies { [key: string]: Access }
