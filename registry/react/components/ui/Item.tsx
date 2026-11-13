import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// One row of a card's list (console2.css .v2-row, .v2-row-link): 12px, its title on the left and what it is on the
// right, 8px above and below. With `href` the whole row is one link that fills to the card's edges with the paper
// under the pointer (it runs 16px past its box, a card's inset); `arrow` adds a chevron that darkens with it. Rows in
// a list share a hairline: put them in ItemGroup. Props for Vue's slots: `media` before the title (a logo, a tile),
// `meta` beside it (a tag, a time), and `actions` at the end, on a row without `href` only (a link holds no buttons).
export interface ItemProps {
  title?: string
  description?: string
  href?: string
  arrow?: boolean
  media?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  className?: string
  /** The title, in place of `title`. */
  children?: ReactNode
}

export function Item({ title, description, href, arrow, media, meta, actions, className, children }: ItemProps) {
  const body = (
    <span className="flex min-w-0 items-center gap-2">
      {media}
      <span className="min-w-0">
        <span className="block truncate text-fg">{children ?? title}</span>
        {description && <span className="block truncate text-fg-muted">{description}</span>}
      </span>
    </span>
  )
  if (href) {
    return (
      <>
        <style href="ds-item" precedence="ds">{css}</style>
        <a data-ds="item" href={href} className={cn('ds-item-link group/item -mx-4 flex items-center justify-between gap-3 px-4 py-2 text-meta', className)}>
          {body}
          <span className="flex shrink-0 items-center gap-2 text-fg-muted">
            {meta}
            {arrow && <ChevronRight size={12} strokeWidth={1.5} className="transition-colors duration-120 ease-standard group-hover/item:text-fg" aria-hidden="true" />}
          </span>
        </a>
      </>
    )
  }
  return (
    <div data-ds="item" className={cn('flex items-center justify-between gap-3 py-2 text-meta', className)}>
      {body}
      {(meta || actions) && (
        <span className="flex shrink-0 items-center gap-2 text-fg-muted">
          {meta}
          {actions}
        </span>
      )}
    </div>
  )
}

export default Item

const css = `
.ds-item-link { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-item-link:hover { background: var(--ds-color-surface-subtle); } }
.ds-item-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
`
