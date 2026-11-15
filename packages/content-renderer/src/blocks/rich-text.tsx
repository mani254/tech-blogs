import type { RichTextBlockData } from '../types.js'
import { LexicalRenderer, type SerializedLexicalEditorState } from '../utils/lexical.js'

export interface RichTextBlockProps {
  block: RichTextBlockData
  className?: string
}

export function RichTextBlock({ block, className = '' }: RichTextBlockProps) {
  if (!block?.content) {
    return null
  }

  return (
    <div className={`rich-text-block my-4 ${className}`}>
      <LexicalRenderer content={block.content as SerializedLexicalEditorState} />
    </div>
  )
}
