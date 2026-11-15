import type { Field, FieldHook } from 'payload'
import { formatSlug } from '@/utilities/slug'

export interface SlugFieldOptions {
  fieldToUse?: string
  name?: string
  label?: string
  readOnly?: boolean
  unique?: boolean
  required?: boolean
}

/**
 * Reusable slug field with automatic formatting and sanitization.
 */
export const slugField = ({
  fieldToUse = 'title',
  name = 'slug',
  label = 'Slug (URL Identifier)',
  readOnly = false,
  unique = true,
  required = true,
}: SlugFieldOptions = {}): Field => {
  const formatSlugHook: FieldHook = ({ data, operation, originalDoc, value }) => {
    // If user provided a manual slug, format it
    if (typeof value === 'string' && value.trim()) {
      return formatSlug(value)
    }

    // On creation, if slug is empty, format from source field
    if (operation === 'create') {
      const sourceValue = data?.[fieldToUse]
      if (typeof sourceValue === 'string' && sourceValue.trim()) {
        return formatSlug(sourceValue)
      }
    }

    // On update, if slug is empty, format from source field
    if (operation === 'update') {
      if (!value) {
        const sourceValue = data?.[fieldToUse] || originalDoc?.[fieldToUse]
        if (typeof sourceValue === 'string' && sourceValue.trim()) {
          return formatSlug(sourceValue)
        }
      }
    }

    return value
  }

  return {
    name,
    label,
    type: 'text',
    index: true,
    unique,
    required,
    admin: {
      position: 'sidebar',
      readOnly,
      description: `Auto-generated from ${fieldToUse} if left empty. URL-safe identifier.`,
    },
    hooks: {
      beforeValidate: [formatSlugHook],
    },
  }
}

