'use client'
import { createContext, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

// Menu triggers in a row on the paper (shadcn's menubar in Conare's grammar): a hairline strip, 28px triggers in 12px
// medium, each opening Menu's square panel of rows (MenubarMenu). One trigger is in the tab order; Left and Right move
// along the row, Down, Enter or Space open, and with a menu open Left and Right open the next one. While one is open,
// pointing at another trigger switches to it at once.
export interface MenubarEntry { key: string, el: () => HTMLElement | null, open: () => Promise<void> }
export interface MenubarContextValue {
  active: string | null
  setActive: Dispatch<SetStateAction<string | null>>
  focused: string | null
  setFocused: Dispatch<SetStateAction<string | null>>
  entries: MenubarEntry[]
  move: (from: string, step: number, open: boolean) => void
}
export const MenubarContext = createContext<MenubarContextValue | null>(null)
export interface MenubarProps { label: string, children?: ReactNode }

export function Menubar({ label, children }: MenubarProps) {
  const [active, setActive] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const entries = useRef<MenubarEntry[]>([]).current
  function move(from: string, step: number, open: boolean) {
    const at = entries.findIndex(e => e.key === from)
    const next = entries[(at + step + entries.length) % entries.length]
    if (!next) return
    setFocused(next.key)
    next.el()?.focus()
    if (open) void next.open()
  }
  return (
    <MenubarContext.Provider value={{ active, setActive, focused, setFocused, entries, move }}>
      <div data-ds="menubar" role="menubar" aria-label={label} className="inline-flex items-center gap-0.5 border border-edge bg-surface-subtle p-0.5">
        {children}
      </div>
    </MenubarContext.Provider>
  )
}

export default Menubar
