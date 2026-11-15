import type { CollectionConfig } from 'payload'
import { assertMediaNotReferenced } from '../../utilities/referentialIntegrity.ts'

/**
 * Collection-specific lifecycle hooks for Media uploads.
 */
export const mediaHooks: CollectionConfig['hooks'] = {
  beforeChange: [
    ({ data, req, operation }) => {
      // Auto-assign uploadedBy to current user if operation is create
      if (operation === 'create' && req.user?.id && !data.uploadedBy) {
        data.uploadedBy = req.user.id
      }
      return data
    },
  ],
  beforeDelete: [
    async ({ req, id }) => {
      await assertMediaNotReferenced(req, id)
    },
  ],
}
