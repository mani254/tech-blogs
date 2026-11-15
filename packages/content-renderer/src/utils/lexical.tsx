import * as React from 'react'

// Lexical node format bitmask constants
const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16
const IS_SUBSCRIPT = 32
const IS_SUPERSCRIPT = 64

export interface LexicalNode {
  type: string
  text?: string
  tag?: string
  format?: number | string
  listType?: 'bullet' | 'number' | 'check'
  value?: unknown
  checked?: boolean
  direction?: 'ltr' | 'rtl' | null
  indent?: number
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: 'custom' | 'internal'
    doc?: {
      value?: string | { slug?: string; id?: string }
      relationTo?: string
    }
  }
  children?: LexicalNode[]
  [key: string]: unknown
}

export interface SerializedLexicalEditorState {
  root: LexicalNode
  [key: string]: unknown
}

/**
 * Applies inline formatting masks (bold, italic, code, underline, etc.) to text nodes.
 */
function renderFormattedText(text: string, format: number | string | undefined, key: string | number): React.ReactNode {
  if (typeof format !== 'number' || format === 0) {
    return text
  }

  let element: React.ReactNode = text

  if (format & IS_CODE) {
    element = (
      <code key={`code-${key}`} className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-zinc-900 dark:text-zinc-100">
        {element}
      </code>
    )
  }
  if (format & IS_BOLD) {
    element = <strong key={`bold-${key}`}>{element}</strong>
  }
  if (format & IS_ITALIC) {
    element = <em key={`italic-${key}`}>{element}</em>
  }
  if (format & IS_UNDERLINE) {
    element = <u key={`underline-${key}`}>{element}</u>
  }
  if (format & IS_STRIKETHROUGH) {
    element = <s key={`strike-${key}`}>{element}</s>
  }
  if (format & IS_SUBSCRIPT) {
    element = <sub key={`sub-${key}`}>{element}</sub>
  }
  if (format & IS_SUPERSCRIPT) {
    element = <sup key={`sup-${key}`}>{element}</sup>
  }

  return element
}

/**
 * Recursively converts a Lexical AST node into semantic React elements.
 */
export function serializeLexicalNode(node: LexicalNode, index: number): React.ReactNode {
  const key = `${node.type}-${index}`

  // Text leaf node
  if (node.type === 'text') {
    return renderFormattedText(node.text || '', node.format, key)
  }

  // Linebreak leaf node
  if (node.type === 'linebreak') {
    return <br key={key} />
  }

  // Horizontal rule leaf node
  if (node.type === 'horizontalrule') {
    return <hr key={key} className="my-8 border-t border-zinc-200 dark:border-zinc-800" />
  }

  // Render children recursively
  const children = Array.isArray(node.children)
    ? node.children.map((child, i) => serializeLexicalNode(child, i))
    : null

  // Structural nodes
  switch (node.type) {
    case 'root':
      return <React.Fragment key={key}>{children}</React.Fragment>

    case 'paragraph':
      return (
        <p key={key} className="mb-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          {children && children.length > 0 ? children : <br />}
        </p>
      )

    case 'heading': {
      const Tag = (node.tag || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const headingClasses: Record<string, string> = {
        h1: 'mt-8 mb-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100',
        h2: 'mt-8 mb-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100',
        h3: 'mt-6 mb-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100',
        h4: 'mt-4 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100',
        h5: 'mt-4 mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100',
        h6: 'mt-4 mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100',
      }
      return (
        <Tag key={key} className={headingClasses[Tag] || headingClasses.h2}>
          {children}
        </Tag>
      )
    }

    case 'quote':
      return (
        <blockquote
          key={key}
          className="my-6 border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic text-zinc-600 dark:text-zinc-400"
        >
          {children}
        </blockquote>
      )

    case 'list': {
      const isOrdered = node.listType === 'number'
      const isCheck = node.listType === 'check'

      if (isOrdered) {
        return (
          <ol key={key} className="my-4 ml-6 list-decimal space-y-1.5 text-zinc-700 dark:text-zinc-300">
            {children}
          </ol>
        )
      }

      if (isCheck) {
        return (
          <ul key={key} className="my-4 space-y-1.5 text-zinc-700 dark:text-zinc-300">
            {children}
          </ul>
        )
      }

      return (
        <ul key={key} className="my-4 ml-6 list-disc space-y-1.5 text-zinc-700 dark:text-zinc-300">
          {children}
        </ul>
      )
    }

    case 'listitem': {
      if (typeof node.checked === 'boolean') {
        return (
          <li key={key} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={node.checked}
              readOnly
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600"
            />
            <span className={node.checked ? 'line-through text-zinc-400' : ''}>
              {children}
            </span>
          </li>
        )
      }
      return (
        <li key={key} className="leading-6">
          {children}
        </li>
      )
    }

    case 'link':
    case 'autolink': {
      const url = node.fields?.url || '#'
      const newTab = Boolean(node.fields?.newTab)
      return (
        <a
          key={key}
          href={url}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
          className="font-medium text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 transition-colors"
        >
          {children}
        </a>
      )
    }

    default:
      // Unknown or unsupported container node — safely render its children
      return <React.Fragment key={key}>{children}</React.Fragment>
  }
}

/**
 * Serializes a full Payload Lexical AST into semantic, accessible JSX.
 */
export function LexicalRenderer({
  content,
  className = '',
}: {
  content?: SerializedLexicalEditorState | null
  className?: string
}) {
  if (!content?.root) {
    return null
  }

  return (
    <div className={`lexical-content ${className}`}>
      {serializeLexicalNode(content.root, 0)}
    </div>
  )
}

