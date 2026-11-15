import type { CodeBlockData } from '../types.js'
import { CopyCodeButton } from './copy-code-button.js'

export interface CodeBlockProps {
  block: CodeBlockData
  className?: string
}

function parseHighlightedLines(highlightedLines?: string | null): Set<number> {
  const set = new Set<number>()
  if (!highlightedLines) return set

  const parts = highlightedLines.split(',')
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          set.add(i)
        }
      }
    } else {
      const num = Number(trimmed)
      if (!isNaN(num)) {
        set.add(num)
      }
    }
  }
  return set
}

export function CodeBlock({ block, className = '' }: CodeBlockProps) {
  if (!block?.code) {
    return null
  }

  const lines = block.code.split('\n')
  const showLineNumbers = block.showLineNumbers ?? false
  const startingLine = block.startingLineNumber ?? 1
  const highlighted = parseHighlightedLines(block.highlightedLines)
  const enableCopy = block.enableCopy ?? true

  const headerLabel = block.filename || block.title || null

  return (
    <div
      className={`code-block my-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md ${className}`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 inline-block" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80 inline-block" />
          {headerLabel && (
            <span className="ml-2 font-medium text-zinc-300 truncate">
              {headerLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {block.language || 'plaintext'}
          </span>
          {enableCopy && <CopyCodeButton code={block.code} />}
        </div>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto p-4 font-mono text-sm leading-6">
        <pre className="m-0">
          <code>
            {lines.map((line, idx) => {
              const lineNum = startingLine + idx
              const isHighlighted = highlighted.has(lineNum)

              return (
                <div
                  key={idx}
                  className={`flex ${
                    isHighlighted ? 'bg-zinc-800/60 -mx-4 px-4 border-l-2 border-blue-500' : ''
                  }`}
                >
                  {showLineNumbers && (
                    <span className="mr-4 inline-block w-8 select-none text-right text-zinc-600">
                      {lineNum}
                    </span>
                  )}
                  <span className="flex-1">{line || '\n'}</span>
                </div>
              )
            })}
          </code>
        </pre>
      </div>
    </div>
  )
}
