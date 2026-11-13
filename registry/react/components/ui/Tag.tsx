import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A short label for a state or a kind (console2.css .c-badge under the console): 18px, square, 11px lowercase words.
// default: a hairline in ink; working: black, for a source at work; failed: the red wash with a red square; quiet: a
// hairline in the muted grey, for a note such as "default" or "invited". The word carries the state, never colour alone.
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'working' | 'failed' | 'quiet'
  /** What leads the word (Vue's `mark` slot); by default a red square on `failed`. */
  mark?: ReactNode
  'data-ds'?: string
}

const TONES = {
  default: 'border-edge text-fg',
  working: 'border-status-working bg-status-working text-status-working-fg',
  failed: 'border-transparent bg-status-failed text-status-failed-fg',
  quiet: 'border-edge text-fg-muted',
}

export function Tag({ tone = 'default', mark, className, children, ...rest }: TagProps) {
  return (
    <span data-ds="tag" className={cn('inline-flex h-4.5 items-center gap-1 border px-1.25 pb-0.5 text-caption leading-4 font-normal whitespace-nowrap', TONES[tone], className)} {...rest}>
      {mark ?? (tone === 'failed' && <span className="mt-0.5 size-1 shrink-0 bg-edge-accent" aria-hidden="true" />)}
      {children}
    </span>
  )
}

export default Tag
