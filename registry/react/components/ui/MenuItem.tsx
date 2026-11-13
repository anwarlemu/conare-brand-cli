'use client'
import { useContext, type ReactNode } from 'react'
import { MenuClose } from '@/react/components/ui/Menu'

// One row of a Menu (console2.css .v2-menu-item): 32px (44px on phones), 13px, a 14px gutter that holds the 4px red
// square marker of the row under the pointer or focus, which also takes the paper fill. `current` sets it in medium
// weight; `danger` is Sign out's red. Put a 14px Lucide icon first (text-fg-muted), a count or a check last.
// Choosing it calls `onSelect` and closes the menu, unless `keepOpen`.
export interface MenuItemProps { href?: string, current?: boolean, danger?: boolean, disabled?: boolean, keepOpen?: boolean, onSelect?: () => void, className?: string, children?: ReactNode }

export function MenuItem({ href, current, danger, disabled, keepOpen, onSelect, className, children }: MenuItemProps) {
  const close = useContext(MenuClose)
  function choose() {
    onSelect?.()
    if (!keepOpen) close()
  }
  const shared = { 'data-ds': 'menu-item', role: 'menuitem', className: className ? `ds-menu-item ${className}` : 'ds-menu-item', 'aria-current': current ? 'true' as const : undefined, 'data-danger': danger || undefined, onClick: choose }
  return (
    <>
      <style href="ds-menu-item" precedence="ds">{css}</style>
      {href ? <a href={href} {...shared}>{children}</a> : <button type="button" disabled={disabled} {...shared}>{children}</button>}
    </>
  )
}

export default MenuItem

const css = `
.ds-menu-item { position: relative; display: flex; width: 100%; height: var(--ds-size-control-md); align-items: center; gap: var(--ds-space-md); padding: 0 10px 0 14px; color: var(--ds-color-fg); font-size: var(--ds-text-ui); text-align: left; outline: none; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-menu-item::before { position: absolute; top: 50%; left: 5px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-menu-item:focus-visible { background: var(--ds-color-surface-subtle); }
.ds-menu-item:focus-visible::before { opacity: 1; }
@media (hover: hover) and (pointer: fine) {
  .ds-menu-item:hover { background: var(--ds-color-surface-subtle); }
  .ds-menu-item:hover::before { opacity: 1; }
  .ds-menu-item[data-danger]:hover { background: var(--ds-color-surface-danger); }
}
.ds-menu-item[aria-current="true"] { font-weight: var(--ds-font-weight-medium); }
.ds-menu-item:disabled { color: var(--ds-color-fg-muted); cursor: progress; }
.ds-menu-item[data-danger] { color: var(--ds-color-fg-danger); }
.ds-menu-item[data-danger]:focus-visible { background: var(--ds-color-surface-danger); }
@media (pointer: coarse), (max-width: 767px) { .ds-menu-item { height: auto; min-height: 44px; } }
`
