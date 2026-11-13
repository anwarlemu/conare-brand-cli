'use client'
import { useEffect, useRef, useState, type ComponentType, type MouseEvent, type KeyboardEvent, type ReactNode, type SyntheticEvent } from 'react'
import { Braces, Database, Search } from 'lucide-react'
import { useControllable } from '@/react/hooks/useControllable'

// One box for everything (Command.vue, .v2-cmd): documents as you type, namespaces, pages and actions. It opens many
// times a day, from ⌘K, / or the sidebar's search, so it shows and hides without animation. 560px wide, 15vh from the
// top on a page dimmed 24%, square, a hairline, no shadow: the website's dark window by default (`tone: 'dark'`, a
// title bar with the mark and a Search tag, key chips at the foot), or on the paper (`tone: 'light'`). The input
// keeps focus: arrows move the highlighted row (the menus' row with its red square), Enter runs it, Tab stays in the
// box, Escape or a press on the dimmed page closes and focus returns to what opened it. Rows are Menu's rows; the
// highlight follows the arrows and the pointer alike. Documents come from the app: `onQuery` hears the text as typed
// (debounce it); pass `documents` and `searching`. `onSelect` gets the row picked. Vue's v-model:open is `open` with
// `onOpenChange` (or `defaultOpen` alone); the `mark` slot is the `mark` prop.
export type PaletteIcon = ComponentType<{ size?: number, strokeWidth?: number, className?: string, 'aria-hidden'?: boolean | 'true' }>
export interface PaletteDocument { id: string, namespace?: string, text?: string, logo?: string | null }
export interface PaletteNamespace { name: string, documents: number, logo?: string | null }
export interface PaletteLink { id?: string, label: string, icon?: PaletteIcon, href?: string }
export type PalettePick =
  | { kind: 'search', query: string }
  | { kind: 'document', document: PaletteDocument }
  | { kind: 'namespace', namespace: PaletteNamespace }
  | { kind: 'page', page: PaletteLink }
  | { kind: 'action', action: PaletteLink }

export interface CommandPaletteProps {
  pages: PaletteLink[]
  actions?: PaletteLink[]
  namespaces?: PaletteNamespace[]
  documents?: PaletteDocument[]
  searching?: boolean
  tone?: 'dark' | 'light'
  title?: string
  placeholder?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onQuery?: (text: string) => void
  onSelect?: (pick: PalettePick) => void
  mark?: ReactNode
}

interface Row { id: string, group: string, label: string, pick: PalettePick, icon?: PaletteIcon, logo?: string | null, meta?: string, text?: string, mono?: boolean }
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function CommandPalette({ pages, actions = [], namespaces = [], documents = [], searching, tone = 'dark', title = 'Conare', placeholder = 'Search documents, namespaces and pages', open: openProp, defaultOpen = false, onOpenChange, onQuery, onSelect, mark }: CommandPaletteProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)
  const input = useRef<HTMLInputElement | null>(null)
  const [text, setText] = useState('')
  const q = text.trim()
  const [activeId, setActiveId] = useState('')
  const heard = useRef(q)
  const query = useRef(onQuery)
  query.current = onQuery
  useEffect(() => {
    if (heard.current === q) return
    heard.current = q
    setActiveId('')
    query.current?.(q)
  }, [q])

  const has = (label: string) => !q || label.toLowerCase().includes(q.toLowerCase())
  const logoOf = (namespace?: string) => namespaces.find(n => n.name === namespace)?.logo ?? null
  const rows: Row[] = []
  if (q) {
    rows.push({ id: 'search', group: '', label: `Search documents for "${q}"`, icon: Search, pick: { kind: 'search', query: q } })
    for (const d of documents) rows.push({ id: `doc:${d.namespace}/${d.id}`, group: 'Documents', label: d.id, mono: true, logo: d.logo ?? logoOf(d.namespace), meta: d.namespace, text: d.text, pick: { kind: 'document', document: d } })
  }
  // With nothing typed, the five largest namespaces, so the pages stay in view.
  const matching = namespaces.filter(n => has(n.name))
  for (const n of q ? matching : matching.slice(0, 5)) rows.push({ id: `ns:${n.name}`, group: 'Namespaces', label: n.name, mono: true, logo: n.logo, meta: compact.format(n.documents), pick: { kind: 'namespace', namespace: n } })
  for (const p of pages.filter(p => has(p.label))) rows.push({ id: `page:${p.id ?? p.label}`, group: 'Pages', label: p.label, icon: p.icon, pick: { kind: 'page', page: p } })
  for (const a of actions.filter(a => has(a.label))) rows.push({ id: `act:${a.id ?? a.label}`, group: 'Actions', label: a.label, icon: a.icon, pick: { kind: 'action', action: a } })
  const groups: Array<{ label: string, rows: Row[] }> = []
  for (const row of rows) {
    const last = groups.at(-1)
    if (last && last.label === row.group) last.rows.push(row)
    else groups.push({ label: row.group, rows: [row] })
  }

  // The highlighted row is kept by id, so documents arriving later don't move it.
  const activeIndex = Math.max(0, rows.findIndex(r => r.id === activeId))
  const scroll = useRef(false)
  useEffect(() => {
    if (!scroll.current) return
    scroll.current = false
    document.getElementById(`ds-cmd-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  })
  function move(step: number) {
    const n = rows.length
    if (!n) return
    setActiveId(rows[(activeIndex + step + n) % n]!.id)
    scroll.current = true
  }
  function run(row: Row | undefined) {
    if (!row) return
    onSelect?.(row.pick)
    if (row.pick.kind !== 'search') setOpen(false)
  }
  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
    else if (event.key === 'Enter') { event.preventDefault(); run(rows[activeIndex]) }
    // Focus stays in the box: the rows are reached by arrows, not Tab.
    else if (event.key === 'Tab') event.preventDefault()
  }

  const returnTo = useRef<HTMLElement | null>(null)
  const mounted = useRef(false)
  useEffect(() => {
    const d = dialog.current
    const first = !mounted.current
    mounted.current = true
    if (!d) return
    if (open) {
      if (d.open) return
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      d.showModal()
      input.current?.focus()
    }
    else if (!first) {
      if (d.open) d.close()
      setText('')
      returnTo.current?.focus({ preventScroll: true })
    }
  }, [open])
  // The dialog's own Escape (cancel) and a press on the dimmed page, which lands on the dialog element itself.
  function onCancel(event: SyntheticEvent) {
    event.preventDefault()
    setOpen(false)
  }
  function onDown(event: MouseEvent) {
    if (event.target === dialog.current) setOpen(false)
  }

  return (
    <>
      <style href="ds-command-palette" precedence="ds">{css}</style>
      <dialog data-ds="command-palette" ref={dialog} className="ds-cmd" data-tone={tone} aria-label="search and jump" onCancel={onCancel} onMouseDown={onDown}>
        {tone === 'dark' && (
          <div className="ds-cmd-bar" aria-hidden="true">
            {mark}
            <span>{title}</span><span className="ds-cmd-tag">Search</span>
          </div>
        )}
        <label className="ds-cmd-box">
          <Search size={14} strokeWidth={1.5} className="ds-cmd-muted shrink-0" aria-hidden="true" />
          <input
            ref={input}
            value={text}
            onChange={e => setText(e.target.value)}
            enterKeyHint="search"
            role="combobox"
            aria-controls="ds-cmd-list"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-activedescendant={rows.length ? `ds-cmd-${activeIndex}` : undefined}
            placeholder={placeholder}
            aria-label={placeholder.toLowerCase()}
            autoComplete="off"
            spellCheck="false"
            onKeyDown={onKey}
          />
        </label>
        <div id="ds-cmd-list" className="ds-cmd-list" role="listbox" aria-label="results">
          {groups.map(g => (
            <div key={g.label || 'search'} role="group" aria-label={g.label || undefined}>
              {g.label && <p className="ds-cmd-label" aria-hidden="true">{g.label}{g.label === 'Documents' && searching && <span>Searching</span>}</p>}
              {g.rows.map((row) => {
                const i = rows.indexOf(row)
                const Icon = row.icon
                return (
                  <div
                    id={`ds-cmd-${i}`}
                    key={row.id}
                    role="option"
                    className="ds-cmd-row"
                    data-doc={row.text ? true : undefined}
                    aria-selected={i === activeIndex}
                    data-active={i === activeIndex || undefined}
                    onMouseMove={() => setActiveId(row.id)}
                    onClick={() => run(row)}
                  >
                    {row.logo
                      ? <img src={row.logo} alt="" width={14} height={14} className="size-3.5 shrink-0 object-contain" />
                      : Icon
                        ? <Icon size={14} strokeWidth={1.5} className="ds-cmd-muted shrink-0" aria-hidden="true" />
                        : row.group === 'Documents'
                          ? <Braces size={14} strokeWidth={1.5} className="ds-cmd-muted shrink-0" aria-hidden="true" />
                          : <Database size={14} strokeWidth={1.5} className="ds-cmd-muted shrink-0" aria-hidden="true" />}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex min-w-0 items-baseline gap-2">
                        {row.text && row.meta && <span className="ds-cmd-muted shrink-0 type-code-sm">{row.meta}</span>}
                        <span className={row.mono ? 'truncate type-code-sm' : 'truncate'}>{row.label}</span>
                      </span>
                      {row.text && <span className="ds-cmd-muted truncate type-meta">{row.text}</span>}
                    </span>
                    {row.meta && !row.text && <span className="ds-cmd-muted min-w-10 text-right text-meta tabular-nums">{row.meta}</span>}
                  </div>
                )
              })}
            </div>
          ))}
          {!rows.length && <p className="ds-cmd-muted px-3.5 py-2 type-meta">{`Nothing matches "${q}".`}</p>}
        </div>
        {tone === 'dark' && (
          <div className="ds-cmd-foot" aria-hidden="true">
            <span className="ds-cmd-key">↑↓ move</span><span className="ds-cmd-key">↵ open</span><span className="ds-cmd-key">esc close</span>
          </div>
        )}
      </dialog>
    </>
  )
}

export default CommandPalette

const css = `
/* No transition or animation anywhere: it opens and closes at once. */
.ds-cmd { position: fixed; inset: 15vh auto auto 50%; display: none; width: min(var(--ds-layout-palette), calc(100vw - 32px)); max-width: none; max-height: none; flex-direction: column; margin: 0; padding: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); overscroll-behavior: contain; transform: translateX(-50%); }
.ds-cmd[open] { display: flex; }
.ds-cmd::backdrop { background: var(--ds-color-scrim-palette); }
.ds-cmd-muted { color: var(--ds-color-fg-muted); }
.ds-cmd-box { display: flex; height: 44px; flex-shrink: 0; align-items: center; gap: var(--ds-space-md); padding: 0 14px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-cmd-box input { min-width: 0; flex: 1; background: transparent; color: inherit; font-size: var(--ds-text-body); outline: none; }
.ds-cmd-box input::placeholder { color: var(--ds-color-fg-muted); }
/* iOS zooms into a field under 16px. */
@media (pointer: coarse), (max-width: 767px) { .ds-cmd-box input { font-size: var(--ds-text-input); } }
.ds-cmd-list { max-height: min(400px, 60vh); overflow-y: auto; overscroll-behavior: contain; padding: var(--ds-space-xs); }
.ds-cmd-label { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-md); padding: 6px 10px 4px 14px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
.ds-cmd-row { position: relative; display: flex; height: var(--ds-size-control-md); align-items: center; gap: var(--ds-space-md); padding: 0 10px 0 14px; color: inherit; cursor: pointer; }
.ds-cmd-row::before { position: absolute; top: 50%; left: 5px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; }
.ds-cmd-row[data-active] { background: var(--ds-color-surface-subtle); }
.ds-cmd-row[data-active]::before { opacity: 1; }
.ds-cmd-row[data-doc] { height: auto; min-height: 44px; padding-top: 6px; padding-bottom: 6px; }
.ds-cmd-foot { display: flex; align-items: center; gap: var(--ds-space-sm); padding: 8px 12px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-cmd-key { padding: 1px 6px; background: var(--ds-color-surface-subtle); }
/* The website's dark window (console2.css .v2-cmd[data-skin="1"]). */
.ds-cmd[data-tone="dark"] { border-color: var(--ds-color-neutral-300); background: var(--ds-color-neutral-100); color: var(--ds-color-off-white); }
.ds-cmd-bar { display: flex; height: 40px; flex-shrink: 0; align-items: center; gap: var(--ds-space-md); padding: 0 16px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-neutral-300); }
.ds-cmd-tag { padding: 1px 6px; background: var(--ds-color-neutral-200); color: var(--ds-color-neutral-600); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-cmd[data-tone="dark"] :is(.ds-cmd-box, .ds-cmd-foot) { border-color: var(--ds-color-neutral-300); }
.ds-cmd[data-tone="dark"] :is(.ds-cmd-muted, .ds-cmd-label, .ds-cmd-foot, .ds-cmd-box input::placeholder) { color: var(--ds-color-neutral-500); }
.ds-cmd[data-tone="dark"] .ds-cmd-row[data-active] { background: var(--ds-color-neutral-200); }
.ds-cmd[data-tone="dark"] .ds-cmd-key { background: var(--ds-color-neutral-200); color: var(--ds-color-neutral-600); }
.ds-cmd[data-tone="dark"] .ds-cmd-row img { filter: invert(1); }
@media (max-width: 767px) { .ds-cmd-foot { display: none; } }
@media (pointer: coarse), (max-width: 767px) { .ds-cmd-row { height: auto; min-height: 44px; } }
`
