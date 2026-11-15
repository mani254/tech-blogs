import type { Access, FieldAccess } from 'payload'
import { isAdmin } from '../../access/isAdmin.ts'

/**
 * Admins can access all operations; users can update their own accounts.
 */
export const usersAccess = {
  admin: ({ req: { user } }) => Boolean(user && user.isActive !== false),
  create: isAdmin,
  read: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin' || user.role === 'editor') return true
    return {
      id: {
        equals: user.id,
      },
    }
  },
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return {
      id: {
        equals: user.id,
      },
    }
  },
  delete: isAdmin,
} satisfies { [key: string]: Access }

/**
 * Field-level access ensuring ONLY administrators can alter user roles or account activation status.
 */
export const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && user.role === 'admin')
}
