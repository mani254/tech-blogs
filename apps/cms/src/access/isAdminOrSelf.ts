import type { Access, Where } from 'payload'

/**
 * Access function permitting administrators full access, or individual users access to their own record.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  if (user.role === 'admin') {
    return true
  }

  return {
    id: {
      equals: user.id,
    },
  } satisfies Where
}

