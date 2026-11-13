import type { CSSProperties } from 'react'
import { cn } from '@/react/lib/cn'

// The website's dot-matrix loader (console2.css .v2-matrix): a 3 by 3 of 2px squares that blink in a sweep, for
// anything at work (a search, a sync). Put it beside the word for what is working; show it only after 300ms.
// Reduced motion holds it still. `tone="inverse"` is for a dark ground (a working tag, a dark button).
export interface DotMatrixProps {
  tone?: 'default' | 'inverse'
  className?: string
}

const ORDER = [0, 1, 2, 7, 8, 3, 6, 5, 4]

export function DotMatrix({ tone, className }: DotMatrixProps) {
  return (
    <>
      <style href="ds-dot-matrix" precedence="ds">{css}</style>
      <span data-ds="dot-matrix" className={cn('ds-matrix', className)} data-tone={tone} aria-hidden="true">{ORDER.map((k, i) => <i key={i} style={{ '--k': k } as CSSProperties} />)}</span>
    </>
  )
}

export default DotMatrix

const css = `
.ds-matrix { display: grid; grid-template-columns: repeat(3, 2px); gap: var(--ds-space-2xs); flex-shrink: 0; }
.ds-matrix i { width: 2px; height: 2px; background: var(--ds-color-neutral-500); animation: ds-blink 900ms steps(1, end) infinite; animation-delay: calc(var(--k) * 100ms); }
.ds-matrix[data-tone="inverse"] i { background: var(--ds-color-surface); }
@keyframes ds-blink { 0% { opacity: 1; } 50% { opacity: 0.2; } }
@media (prefers-reduced-motion: reduce) { .ds-matrix i { animation: none; } }
`
