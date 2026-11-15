import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Courses } from './collections/Courses'
import { Articles } from './collections/Articles'

// Globals
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const r2Endpoint =
  process.env.CLOUDFLARE_R2_ENDPOINT ||
  process.env.CLOUDFARE_R2_ENDPOINT ||
  (process.env.CLOUDFLARE_R2_ACCOUNT_ID
    ? `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined)

const r2PublicDomain =
  process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN ||
  process.env.CLOUDFLARE_R2_PUBLIC_URL

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Authors,
    Categories,
    Tags,
    Courses,
    Articles,
  ],
  globals: [
    SiteSettings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-payload-secret-key-for-development-and-build',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tech_blogs_cms',
    afterOpenConnection: async (adapter) => {
      try {
        const articlesCollection = adapter.connection.collection('articles')
        // Enforce compound uniqueness for course lessons while allowing null course/pageNumber for news and blogs
        await articlesCollection.createIndex(
          { course: 1, pageNumber: 1 },
          {
            unique: true,
            sparse: true,
            partialFilterExpression: {
              course: { $exists: true, $ne: null },
              pageNumber: { $exists: true, $ne: null },
            },
          },
        )
      } catch {
        // Safe to ignore during static build or disconnected offline runs
      }
    },
  }),
  sharp,
  plugins: [
    ...(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && r2Endpoint
      ? [
          s3Storage({
            collections: {
              media: {
                generateFileURL: ({ filename, prefix }) => {
                  if (r2PublicDomain) {
                    const cleanDomain = r2PublicDomain.replace(/\/+$/, '')
                    return prefix ? `${cleanDomain}/${prefix}/${filename}` : `${cleanDomain}/${filename}`
                  }
                  return `/api/media/file/${filename}`
                },
                disablePayloadAccessControl: true,
              },
            },
            bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cms-library',
            config: {
              credentials: {
                accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
              },
              region: 'auto',
              endpoint: r2Endpoint,
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
})
