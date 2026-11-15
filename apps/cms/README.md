# @org/cms (Payload CMS v3 + Next.js App Router)

Payload CMS v3 headless content management system for Tech Blogs.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS v3 (`3.93.0`)
- **Database**: MongoDB via `@payloadcms/db-mongodb` (database: `tech_blogs_cms`)
- **Editor**: Lexical Rich Text Editor (`@payloadcms/richtext-lexical`)
- **Storage**: Cloudflare R2 via `@payloadcms/storage-s3` (ready for future schemas)

## Scripts
- `pnpm --filter @org/cms dev` - Run Payload CMS development server on port 3001
- `pnpm --filter @org/cms build` - Build the Next.js and Payload CMS application
- `pnpm --filter @org/cms typecheck` - Run TypeScript compiler checks
- `pnpm --filter @org/cms generate:types` - Regenerate Payload TypeScript definitions (`payload-types.ts`)
- `pnpm --filter @org/cms generate:importmap` - Regenerate Payload component import map

