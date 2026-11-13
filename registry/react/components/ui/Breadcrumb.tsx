import { Fragment, type ElementType, type MouseEvent } from 'react'
import { Slash } from 'lucide-react'
import { cn } from '@/react/lib/cn'

// Where you are (console2.css .v2-crumb): each step back a link in muted text that turns ink under the pointer, a 10px
// slash between, the page itself in ink and the only step that truncates. `mono` sets a namespace or an ID in Geist
// Mono. `as` renders a router link component for the steps back (it gets `href` and `to`). Vue's `navigate` event is
// `onNavigate`.
export interface Crumb { label: string, href?: string, mono?: boolean }
export interface BreadcrumbProps { items: Crumb[], label?: string, as?: ElementType, onNavigate?: (crumb: Crumb, event: MouseEvent) => void }

export function Breadcrumb({ items, label = 'breadcrumb', as: Link = 'a', onNavigate }: BreadcrumbProps) {
  return (
    <>
      <style href="ds-breadcrumb" precedence="ds">{css}</style>
      <nav data-ds="breadcrumb" className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-meta leading-5" aria-label={label}>
        {items.map((crumb, i) => (
          <Fragment key={i}>
            {i > 0 && <Slash size={10} strokeWidth={1.5} className="shrink-0 text-fg-faint" aria-hidden="true" />}
            {i < items.length - 1
              ? <Link href={crumb.href ?? '#'} to={Link === 'a' ? undefined : crumb.href} className={cn('ds-crumb shrink-0', crumb.mono && 'type-code-sm')} onClick={(event: MouseEvent) => onNavigate?.(crumb, event)}>{crumb.label}</Link>
              : <span className={cn('truncate text-fg', crumb.mono && 'type-code-sm')} aria-current="page">{crumb.label}</span>}
          </Fragment>
        ))}
      </nav>
    </>
  )
}

export default Breadcrumb

const css = `
.ds-crumb { color: var(--ds-color-fg-muted); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-crumb:hover { color: var(--ds-color-fg); } }
.ds-crumb:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
`
