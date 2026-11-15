import console from 'node:console'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourcePath = path.resolve(__dirname, '../src/payload-types.ts')
const targetDir = path.resolve(__dirname, '../../../packages/shared/src/cms')
const targetPath = path.join(targetDir, 'payload-types.ts')

if (fs.existsSync(sourcePath)) {
  fs.mkdirSync(targetDir, { recursive: true })
  let content = fs.readFileSync(sourcePath, 'utf8')

  // In packages/shared, 'payload' package is not installed as a runtime dependency.
  // Transform the ambient 'payload' module augmentation into a standalone exported interface.
  content = content.replace(
    /declare module 'payload'\s*\{[\s\S]*?\n\}/g,
    '// Ambient module augmentation omitted for standalone shared consumption\nexport interface GeneratedTypes extends Config {}',
  )

  fs.writeFileSync(targetPath, content, 'utf8')
  console.log(`[sync-types] Successfully copied and adapted payload-types.ts -> ${targetPath}`)
} else {
  console.warn(`[sync-types] Source file not found: ${sourcePath}`)
}
