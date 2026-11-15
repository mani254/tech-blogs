import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export type IsAuthor = (args: AccessArgs<User>) => boolean

/**
 * Access control function ensuring the requesting user has 'admin', 'editor', or 'author' role.
 */
export const isAuthor: IsAuthor = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'admin' || user.role === 'editor' || user.role === 'author'
}

