import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

type IsAuthenticated = (args: AccessArgs<User>) => boolean

/**
 * Access control function ensuring the requesting user is authenticated in Payload CMS.
 */
export const authenticated: IsAuthenticated = ({ req: { user } }) => {
  return Boolean(user)
}

