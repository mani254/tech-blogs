import type { CollectionConfig } from 'payload'

/**
 * Collection-specific lifecycle hooks for Users.
 */
export const usersHooks: CollectionConfig['hooks'] = {
  beforeChange: [
    async ({ data, req, operation }) => {
      // Prevent deactivating the last active administrator
      if (operation === 'update' && data?.isActive === false) {
        const activeAdmins = await req.payload.find({
          collection: 'users',
          where: {
            and: [
              { role: { equals: 'admin' } },
              { isActive: { equals: true } },
            ],
          },
          limit: 2,
        })

        if (activeAdmins.totalDocs <= 1 && activeAdmins.docs[0]?.id === req.user?.id) {
          throw new Error('Cannot deactivate the sole remaining active administrator account.')
        }
      }
      return data
    },
  ],
}
