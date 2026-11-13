import type { ElementType, ReactNode } from 'react'

// Loading is never empty (console2.css [data-held], useHeld.ts): a held part is the real part drawn from a blank
// record. Its layout and its rules stay and nothing in it shows, so nothing moves when the answer lands, and the rules
// come in after 300ms, so a fast answer never shows them. Never a shimmer block. Wrap the real markup (`as="tr"` for a
// table row, whose cells keep their rules) and pass `held` while it loads; it renders the children as is once loaded.
export interface SkeletonProps {
  held?: boolean
  as?: ElementType
  label?: string
  className?: string
  children?: ReactNode
}

export function Skeleton({ held = true, as: Tag = 'div', label = 'Loading', className, children }: SkeletonProps) {
  return (
    <>
      <style href="ds-skeleton" precedence="ds">{css}</style>
      <Tag data-ds="skeleton" className={className} data-held={held || undefined} aria-busy={held || undefined} aria-label={held ? label : undefined}>{children}</Tag>
    </>
  )
}

export default Skeleton

const css = `
[data-held] { color: transparent !important; pointer-events: none; }
[data-held] * { visibility: hidden; }
tr[data-held] > * { visibility: visible; color: transparent !important; }
tr[data-held] > *, :not(tr)[data-held] { animation: ds-held-in var(--ds-duration-enter) var(--ds-easing-out) 300ms backwards; }
@keyframes ds-held-in { from { border-color: transparent; } }
`
