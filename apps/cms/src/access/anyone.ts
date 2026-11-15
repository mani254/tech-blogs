import type { Access } from 'payload'

/**
 * Access control function allowing public (unauthenticated) access.
 */
export const anyone: Access = () => true

