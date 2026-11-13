import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// The quiet "Show 5 more" under a list (console2.css .v2-more): 12px medium in the soft ink that darkens under the
// pointer, a red focus ring, and a hit area 12px past its words. A list that can grow for years opens a few at a time
// with it, rather than paging.
export interface ShowMoreProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  count?: number
  label?: string
}

export function ShowMore({ count = 5, label, className, children, ...rest }: ShowMoreProps) {
  return (
    <>
      <style href="ds-show-more" precedence="ds">{css}</style>
      <button data-ds="show-more" type="button" className={cn('ds-more relative ml-1 cursor-pointer text-meta font-medium whitespace-nowrap text-fg-soft', className)} {...rest}>{children ?? label ?? `Show ${count} more`}</button>
    </>
  )
}

export default ShowMore

const css = `
.ds-more { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-more::after { position: absolute; inset: -12px; content: ""; }
@media (hover: hover) and (pointer: fine) { .ds-more:hover { color: var(--ds-color-fg); } }
.ds-more:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
`
