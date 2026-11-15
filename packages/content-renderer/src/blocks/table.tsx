import type { TableBlockData } from '../types.js'

export interface TableBlockProps {
  block: TableBlockData
  className?: string
}

export function TableBlock({ block, className = '' }: TableBlockProps) {
  const columns = block.columns || []
  const rows = block.rows || []
  const hasHeaderRow = block.hasHeaderRow ?? true

  if (columns.length === 0 && rows.length === 0) {
    return null
  }

  const alignmentClasses: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className={`table-block my-8 max-w-5xl mx-auto overflow-hidden ${className}`}>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <table className="w-full border-collapse text-sm">
          {block.caption && (
            <caption className="sr-only">{block.caption}</caption>
          )}

          {hasHeaderRow && columns.length > 0 && (
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                {columns.map((col, idx) => {
                  const align = col.alignment || 'left'
                  return (
                    <th
                      key={col.id || idx}
                      scope="col"
                      className={`px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 ${
                        alignmentClasses[align] || 'text-left'
                      }`}
                    >
                      {col.header}
                    </th>
                  )
                })}
              </tr>
            </thead>
          )}

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            {rows.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                {(row.cells || []).map((cell, cellIdx) => {
                  const colAlign = columns[cellIdx]?.alignment || 'left'
                  return (
                    <td
                      key={cell.id || cellIdx}
                      className={`px-4 py-3 text-zinc-700 dark:text-zinc-300 ${
                        alignmentClasses[colAlign] || 'text-left'
                      }`}
                    >
                      {cell.value || ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {block.caption && (
        <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {block.caption}
        </p>
      )}
    </div>
  )
}
