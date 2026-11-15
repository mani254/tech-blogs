import type { CollectionConfig } from 'payload'
import { usersAccess, adminOnlyFieldAccess } from './access'
import { usersHooks } from './hooks'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['name', 'email', 'role', 'isActive', 'createdAt'],
    useAsTitle: 'name',
    group: 'Administration',
  },
  auth: true,
  access: usersAccess,
  hooks: usersHooks,
  fields: [
    {
      name: 'name',
      label: 'Display Name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      access: {
        update: adminOnlyFieldAccess,
        create: adminOnlyFieldAccess,
      },
      options: [
        { label: 'Administrator (Full System Access)', value: 'admin' },
        { label: 'Editor (Content & Publishing Management)', value: 'editor' },
        { label: 'Author (Create & Manage Own Articles)', value: 'author' },
      ],
      admin: {
        description: 'Role determines administrative privileges and publishing rights.',
      },
    },
    {
      name: 'authorProfile',
      label: 'Linked Author Profile',
      type: 'relationship',
      relationTo: 'authors',
      maxDepth: 1,
      admin: {
        description: 'Public author profile associated with this CMS user.',
      },
    },
    {
      name: 'avatar',
      label: 'Profile Avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional profile avatar image.',
      },
    },
    {
      name: 'isActive',
      label: 'Account Active',
      type: 'checkbox',
      defaultValue: true,
      access: {
        update: adminOnlyFieldAccess,
        create: adminOnlyFieldAccess,
      },
      admin: {
        description: 'Deactivating prevents this user from logging into the CMS.',
      },
    },
  ],
  timestamps: true,
}
