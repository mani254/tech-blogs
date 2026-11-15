import type { Access } from 'payload'
import { anyone } from '@/access/anyone'
import { isEditor } from '@/access/isEditor'

export const tagsAccess = {
  read: anyone,
  create: isEditor,
  update: isEditor,
  delete: isEditor,
} satisfies { [key: string]: Access }

