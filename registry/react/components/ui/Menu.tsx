'use client'
import { createContext, useId, useImperativeHandle, type ReactNode, type Ref } from 'react'
import { useMenu } from '@/react/hooks/useMenu'
import { cn } from '@/react/lib/cn'

// A button that opens a short list of choices or actions (console2.css .v2-menu): a square panel in a hairline, no
// shadow, 4px inside; rows from MenuItem. It comes in over 160ms, a 4px drop (a rise when it opens upward), and not at
// all when opened from the keyboard. Arrows, Home, End, Escape, Tab and a click outside are handled (useMenu).
// `offset` moves the panel in from its edge. The trigger's content is `trigger` (a node, or a function of `open`),
// drawn as a secondary button unless `triggerClass` says otherwise. `defaultOpen` opens it with the page; `ref` gets
// { open, show, close } (Vue's exposed open and close).
export const MenuClose = createContext<() => void>(() => {})

export interface MenuHandle { open: boolean, show: (focus?: 'first' | 'last' | 'none') => void, close: (refocus?: boolean) => void }
export interface MenuProps {
  label: string
  up?: boolean
  align?: 'start' | 'end'
  width?: string
  offset?: string
  triggerClass?: string
  triggerLabel?: string
  trigger?: ReactNode | ((open: boolean) => ReactNode)
  defaultOpen?: boolean
  className?: string
  children?: ReactNode
  ref?: Ref<MenuHandle>
}

export function Menu({ label, up, align = 'start', width = '264px', offset = '0px', triggerClass, triggerLabel, trigger: triggerContent, defaultOpen, className, children, ref }: MenuProps) {
  const { open, root, trigger, show, close, toggle, onTriggerKey, onMenuKey } = useMenu(defaultOpen)
  useImperativeHandle(ref, () => ({ open, show, close }), [open, show, close])
  const id = `menu-${useId()}`
  return (
    <MenuClose.Provider value={() => close(true)}>
      <style href="ds-menu" precedence="ds">{css}</style>
      <div data-ds="menu" ref={root} className={cn('relative inline-block', className)}>
        <button
          ref={trigger}
          type="button"
          className={triggerClass ?? 'inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-action-secondary-edge bg-surface px-2.5 text-meta leading-5 font-medium text-fg transition-[border-color,background-color] duration-120 ease-standard hover:border-action-secondary-edge-hover active:bg-surface-subtle aria-expanded:border-action-secondary-edge-hover max-md:h-control-touch max-md:text-ui'}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={id}
          aria-label={triggerLabel}
          onClick={toggle}
          onKeyDown={onTriggerKey}
        >
          {typeof triggerContent === 'function' ? triggerContent(open) : triggerContent}
        </button>
        {open && (
          <div
            id={id}
            className="ds-menu"
            data-up={up || undefined}
            style={{ width, [align === 'end' ? 'right' : 'left']: offset, [up ? 'bottom' : 'top']: 'calc(100% + 4px)' }}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKey}
          >
            {children}
          </div>
        )}
      </div>
    </MenuClose.Provider>
  )
}

export default Menu

const css = `
.ds-menu { position: absolute; z-index: 40; display: flex; flex-direction: column; padding: var(--ds-space-xs); border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); animation: ds-menu-in var(--ds-duration-glide) var(--ds-easing-standard) both; scroll-margin: 8px; }
.ds-menu[data-up] { animation-name: ds-menu-up; }
/* Opened from the keyboard, focus lands on a row at once: no animation. */
.ds-menu:has(:focus-visible) { animation: none; }
.ds-menu > * { flex-shrink: 0; }
@keyframes ds-menu-in { from { opacity: 0; transform: translateY(-4px); } }
@keyframes ds-menu-up { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) { .ds-menu { animation: none; } }
`
