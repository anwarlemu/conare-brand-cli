'use client'
import { Check, Copy } from 'lucide-react'
import { useCopy } from '@/react/hooks/useCopy'
import { cn } from '@/react/lib/cn'

// An identifier or an endpoint as typed, with a button that copies it (CopyText.vue): the value in 12px Geist Mono,
// cut with an ellipsis when it runs out of room (the whole value in its title), and a 20px quiet button whose glyph turns
// to a check for 1.5s. The button is round, as the console draws it, and grows a 44px place to land on phones. One value
// per copy text; never a secret after it was first shown.
export interface CopyTextProps {
  value: string
  label: string
  className?: string
}

export function CopyText({ value, label, className }: CopyTextProps) {
  const { copied, copy } = useCopy()
  return (
    <span data-ds="copy-text" className={cn('inline-flex max-w-full min-w-0 items-center gap-1', className)}>
      <code className="truncate font-code text-meta leading-5" title={value}>{value}</code>
      <button
        type="button"
        className="relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-fg pointer-coarse:after:absolute pointer-coarse:after:-inset-3 pointer-coarse:after:content-[''] max-md:after:absolute max-md:after:-inset-3 max-md:after:content-['']"
        aria-label={copied ? `${label} copied` : `copy ${label}`}
        onClick={(e) => { e.stopPropagation(); void copy(value) }}
      >
        {copied ? <Check size={12} strokeWidth={1.5} aria-hidden="true" /> : <Copy size={12} strokeWidth={1.5} aria-hidden="true" />}
      </button>
    </span>
  )
}

export default CopyText
