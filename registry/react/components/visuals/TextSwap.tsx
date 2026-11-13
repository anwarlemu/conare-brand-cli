import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// Two labels in one cell, so nothing around them moves (console2.css .v2-swap): when `on` turns true the first leaves
// up and the second arrives from below, each with a touch of blur (160ms fade, 220ms move on the strong ease-out), and
// a check in the second label draws its stroke. Put the labels in `a` and `b` (Vue's slots), an icon first in each.
// Reduced motion keeps the cross-fade only.
export interface TextSwapProps {
  on: boolean
  /** The first label, shown while `on` is false. */
  a?: ReactNode
  /** The second label, shown once `on` is true. */
  b?: ReactNode
  className?: string
}

export function TextSwap({ on, a, b, className }: TextSwapProps) {
  return (
    <>
      <style href="ds-text-swap" precedence="ds">{css}</style>
      <span data-ds="text-swap" className={cn('ds-swap', className)} data-on={on}>
        <span className="ds-swap-a" aria-hidden={on || undefined}>{a}</span>
        <span className="ds-swap-b" aria-hidden={!on || undefined}>{b}</span>
      </span>
    </>
  )
}

export default TextSwap

const css = `
.ds-swap { display: inline-grid; }
.ds-swap > span { display: inline-flex; grid-area: 1 / 1; align-items: center; justify-content: center; gap: var(--ds-space-sm); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-swap-b { opacity: 0; filter: blur(2px); transform: translateY(5px) scale(0.96); }
.ds-swap[data-on="true"] .ds-swap-a { opacity: 0; filter: blur(2px); transform: translateY(-5px) scale(0.96); }
.ds-swap[data-on="true"] .ds-swap-b { opacity: 1; filter: none; transform: none; }
.ds-swap-b svg path { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset var(--ds-duration-micro) ease; }
.ds-swap[data-on="true"] .ds-swap-b svg path { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-enter) var(--ds-easing-out) 40ms; }
@media (prefers-reduced-motion: reduce) {
  .ds-swap > span { filter: none !important; transform: none !important; transition: opacity var(--ds-duration-micro) ease; }
  .ds-swap-b svg path { stroke-dashoffset: 0; transition: none; }
}
`
