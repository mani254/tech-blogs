import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export type IsAdmin = (args: AccessArgs<User>) => boolean

/**
 * Access control function ensuring the requesting user has the 'admin' role.
 */
export const isAdmin: IsAdmin = ({ req: { user } }) => {
  return Boolean(user && user.role === 'admin')
}

