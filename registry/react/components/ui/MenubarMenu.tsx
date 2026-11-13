'use client'
import { useContext, useEffect, useId, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { MenuClose } from '@/react/components/ui/Menu'
import { MenubarContext } from '@/react/components/ui/Menubar'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { onMenuRows, usePopover } from '@/react/hooks/usePopover'

// One menu of a Menubar: its trigger and Menu's panel of rows (MenuItem, MenuLabel, MenuSeparator) under it.
export interface MenubarMenuProps { label: string, width?: string, children?: ReactNode }

export function MenubarMenu({ label, width = '224px', children }: MenubarMenuProps) {
  const bar = useContext(MenubarContext)!
  const key = useId()
  const pop = usePopover({ side: 'bottom', align: 'start', gap: 4 })

  async function open(focus: 'first' | 'last' | 'none' = 'first', keyboard = true) {
    await pop.show({ keyboard })
    if (focus === 'none') return pop.panel.current?.focus({ preventScroll: true })
    const rows = [...(pop.panel.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? [])]
    ;(focus === 'last' ? rows.at(-1) : rows[0])?.focus()
  }
  const openRef = useRef(open)
  openRef.current = open
  useEffect(() => {
    const entry = { key, el: () => pop.anchor.current, open: () => openRef.current('first') }
    bar.entries.push(entry)
    bar.setFocused(f => f ?? key)
    return () => { bar.entries.splice(bar.entries.indexOf(entry), 1) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pop.open) bar.setActive(key)
    else bar.setActive(a => (a === key ? null : a))
  }, [pop.open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (bar.active !== key && pop.open) pop.hide(false, true)
  }, [bar.active]) // eslint-disable-line react-hooks/exhaustive-deps

  function onClick(event: MouseEvent) {
    if (pop.open) return pop.hide(event.detail === 0, event.detail === 0)
    void open(event.detail === 0 ? 'first' : 'none', event.detail === 0)
  }
  function onEnter() {
    if (bar.active && bar.active !== key) void open('none', true)
  }
  function onTriggerKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      bar.move(key, event.key === 'ArrowRight' ? 1 : -1, false)
    }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      void open(event.key === 'ArrowDown' ? 'first' : 'last')
    }
  }
  function onPanelKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      pop.hide(false, true)
      bar.move(key, event.key === 'ArrowRight' ? 1 : -1, true)
      return
    }
    onMenuRows(event, pop.panel.current, pop.hide)
  }
  return (
    <MenuClose.Provider value={() => pop.hide(true)}>
      <button
        data-ds="menubar-menu"
        ref={(el) => { pop.anchor.current = el }}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={pop.open}
        tabIndex={bar.focused === key ? 0 : -1}
        className="inline-flex h-control-sm cursor-pointer items-center px-2.5 text-meta leading-5 font-medium text-fg transition-colors duration-120 ease-standard hover:bg-edge/45 aria-expanded:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus max-md:h-control-touch max-md:text-ui"
        onClick={onClick}
        onPointerEnter={onEnter}
        onFocus={() => bar.setFocused(key)}
        onKeyDown={onTriggerKey}
      >
        {label}
      </button>
      <PopoverPanel data-ds="menubar-menu" pop={pop} role="menu" aria-label={label} tabIndex={-1} className="flex flex-col p-1" style={{ width }} onKeyDown={onPanelKey}>
        {children}
      </PopoverPanel>
    </MenuClose.Provider>
  )
}

export default MenubarMenu
