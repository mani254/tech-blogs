'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export interface CopyCodeButtonProps {
  code: string
  className?: string
}

export function CopyCodeButton({ code, className = '' }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard write failure
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer ${
        copied ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' : ''
      } ${className}`}
      aria-label="Copy code to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-zinc-400" />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}
