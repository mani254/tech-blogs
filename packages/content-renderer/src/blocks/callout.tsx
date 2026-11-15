import type { ComponentType } from 'react'
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Bookmark,
} from 'lucide-react'
import type { CalloutBlockData } from '../types.js'
import { LexicalRenderer, type SerializedLexicalEditorState } from '../utils/lexical.js'

export interface CalloutBlockProps {
  block: CalloutBlockData
  className?: string
}

interface VariantStyle {
  container: string
  iconColor: string
  Icon: ComponentType<{ className?: string }>
}

const variantStyles: Record<string, VariantStyle> = {
  info: {
    container: 'border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400',
    Icon: Info,
  },
  warning: {
    container: 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200',
    iconColor: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  success: {
    container: 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  danger: {
    container: 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200',
    iconColor: 'text-rose-600 dark:text-rose-400',
    Icon: AlertOctagon,
  },
  note: {
    container: 'border-zinc-200 bg-zinc-50/80 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200',
    iconColor: 'text-zinc-600 dark:text-zinc-400',
    Icon: Bookmark,
  },
}

export function CalloutBlock({ block, className = '' }: CalloutBlockProps) {
  const variant = block.variant || 'info'
  const style = variantStyles[variant] || variantStyles.info
  const IconComponent = style.Icon

  return (
    <aside
      className={`callout-block my-6 flex gap-3.5 rounded-lg border p-4 shadow-2xs ${style.container} ${className}`}
      aria-label={block.title || `${variant} notice`}
    >
      <div className="shrink-0 pt-0.5">
        <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        {block.title && (
          <h4 className="mb-1 text-sm font-semibold tracking-tight">
            {block.title}
          </h4>
        )}
        <div className="text-sm leading-6">
          <LexicalRenderer content={block.content as SerializedLexicalEditorState} />
        </div>
      </div>
    </aside>
  )
}
