import type { AnchorHTMLAttributes, ComponentType, ElementType } from 'react'
import { cn } from '@/react/lib/cn'

// One page in the Sidebar (console2.css .v2-nav-link): a 28px row (44px on phones) with its 14px icon, the label and
// a count or health at the end. The page you are on sits on white in a hairline, in medium, with a 2px red edge at the
// sidebar's side. `alert` turns the count red when something failed. `as` renders a router link component instead of
// an anchor. Other props (onClick) land on the link.
export interface SidebarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
  active?: boolean
  icon?: ComponentType<{ size?: number, strokeWidth?: number, 'aria-hidden'?: boolean | 'true' }>
  status?: string
  alert?: boolean
  as?: ElementType
}

export function SidebarLink({ href, active, icon: Icon, status, alert, as: Link = 'a', className, children, ...rest }: SidebarLinkProps) {
  return (
    <>
      <style href="ds-sidebar-link" precedence="ds">{css}</style>
      <Link data-ds="sidebar-link" href={href} className={cn('ds-navlink', className)} data-active={active || undefined} aria-current={active ? 'page' : undefined} {...rest}>
        {Icon && <Icon size={14} strokeWidth={1.5} aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {status && <span className={cn('text-meta tabular-nums', alert ? 'text-home-red-press' : 'text-fg-muted')}>{status}</span>}
      </Link>
    </>
  )
}

export default SidebarLink

const css = `
.ds-navlink { position: relative; display: flex; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; gap: var(--ds-space-md); margin: 0 8px; padding: 0 8px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-ui); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-navlink svg { flex-shrink: 0; color: var(--ds-color-fg-muted); }
@media (hover: hover) and (pointer: fine) { .ds-navlink:hover { background: color-mix(in srgb, var(--ds-color-edge) 50%, transparent); color: var(--ds-color-fg); } }
.ds-navlink[data-active] { background: var(--ds-color-surface); color: var(--ds-color-fg); font-weight: var(--ds-font-weight-medium); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: -1px; }
.ds-navlink[data-active]::before { position: absolute; top: 6px; bottom: 6px; left: -8px; width: 2px; background: var(--ds-color-edge-accent); content: ""; }
.ds-navlink[data-active] svg { color: var(--ds-color-fg); }
.ds-navlink:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
@media (pointer: coarse), (max-width: 767px) { .ds-navlink { height: 44px; font-size: var(--ds-text-body); } }
`
