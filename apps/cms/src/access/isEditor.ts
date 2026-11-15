import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export type IsEditor = (args: AccessArgs<User>) => boolean

/**
 * Access control function ensuring the requesting user has either 'admin' or 'editor' role.
 */
export const isEditor: IsEditor = ({ req: { user } }) => {
  return Boolean(user && (user.role === 'admin' || user.role === 'editor'))
}

