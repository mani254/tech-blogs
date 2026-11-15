import { Check } from 'lucide-react'
import type { ListBlockData } from '../types.js'

export interface ListBlockProps {
  block: ListBlockData
  className?: string
}

export function ListBlock({ block, className = '' }: ListBlockProps) {
  const items = block.items || []

  if (items.length === 0) {
    return null
  }

  const listType = block.listType || 'bullet'

  if (listType === 'numbered') {
    return (
      <ol
        className={`list-block my-6 ml-6 list-decimal space-y-2 text-base text-zinc-700 dark:text-zinc-300 leading-7 ${className}`}
      >
        {items.map((item, idx) => (
          <li key={item.id || idx} className="pl-1">
            {item.text}
          </li>
        ))}
      </ol>
    )
  }

  if (listType === 'check') {
    return (
      <ul className={`list-block my-6 space-y-2.5 text-base text-zinc-700 dark:text-zinc-300 leading-7 ${className}`}>
        {items.map((item, idx) => {
          const isChecked = item.checked ?? false
          return (
            <li key={item.id || idx} className="flex items-start gap-3">
              <span
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-500 text-white dark:border-emerald-600 dark:bg-emerald-600'
                    : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                }`}
                aria-hidden="true"
              >
                {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              </span>
              <span className={isChecked ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}>
                {item.text}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <ul
      className={`list-block my-6 ml-6 list-disc space-y-2 text-base text-zinc-700 dark:text-zinc-300 leading-7 ${className}`}
    >
      {items.map((item, idx) => (
        <li key={item.id || idx} className="pl-1">
          {item.text}
        </li>
      ))}
    </ul>
  )
}
