'use client'
import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { usePopover, type Align, type Side } from '@/react/hooks/usePopover'
import { useControllable } from '@/react/hooks/useControllable'

// A list to pick one option from, with a filter over it (ScopeMenu, generalized): Menu's square panel in a hairline,
// 32px rows with the red square marker on the row the arrows or the pointer are on, the pick checked at the end. The
// filter is the console's 28px field with its 12px glyph (.v2-input-icon); `filter: 'auto'` shows it past six options,
// as the scope menu does, and `false` makes it a plain listbox (Select). `pinned` options stay above a hairline and are
// never filtered. Arrows, Home and End move, Enter picks, typing filters (or, with no filter, jumps to the option it
// starts), Escape closes and returns focus to the trigger. The panel portals, flips and stays inside the viewport.
// Vue's slots are render props: `trigger` ({ selected, open }), `option` ({ option, selected }), `empty` (query).
// v-model is `value` with `onValueChange` (or `defaultValue`); `onSelect` gets the option. Other props (id,
// aria-describedby) land on the trigger.
export interface ComboOption { value: string | number, label: string, hint?: string, disabled?: boolean, pinned?: boolean }
export interface ComboboxProps {
  options: ComboOption[]
  label: string
  placeholder?: string
  filter?: boolean | 'auto'
  filterLabel?: string
  width?: string
  side?: Side
  align?: Align
  matchWidth?: boolean
  triggerClass?: string
  disabled?: boolean
  value?: string | number
  defaultValue?: string | number
  onValueChange?: (value: string | number) => void
  onSelect?: (option: ComboOption) => void
  trigger?: (slot: { selected?: ComboOption, open: boolean }) => ReactNode
  option?: (slot: { option: ComboOption, selected: boolean }) => ReactNode
  empty?: (query: string) => ReactNode
  id?: string
  'aria-describedby'?: string
  'data-ds'?: string
}

export function Combobox(props: ComboboxProps) {
  const { options, label, placeholder = 'Choose', filter = true, filterLabel = 'Filter', width, side = 'bottom', align = 'start', matchWidth, triggerClass, disabled, value, defaultValue = '', onValueChange, onSelect, trigger, option, empty, 'data-ds': ds = 'combobox', ...attrs } = props
  const [model, setModel] = useControllable(value, defaultValue, onValueChange)
  const pop = usePopover({ side, align, matchWidth, gap: 4 })
  const id = `combobox-${useId()}`
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement | null>(null)
  const list = useRef<HTMLDivElement | null>(null)

  const filtering = filter === 'auto' ? options.filter(o => !o.pinned).length > 6 : filter
  const selected = options.find(o => o.value === model)
  const pinned = options.filter(o => o.pinned)
  const rest = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = options.filter(o => !o.pinned)
    return q ? all.filter(o => o.label.toLowerCase().includes(q)) : all
  }, [options, query])
  const visible = [...pinned, ...rest]
  const optionId = (i: number) => `${id}-${i}`

  const enabled = (i: number) => !visible[i]?.disabled
  function move(to: number, step = 1, among = visible) {
    const n = among.length
    if (!n) return
    for (let k = 0; k < n; k++) {
      const i = ((to + k * step) % n + n) % n
      if (!among[i]?.disabled) {
        setActive(i)
        requestAnimationFrame(() => document.getElementById(optionId(i))?.scrollIntoView({ block: 'nearest' }))
        return
      }
    }
  }
  const firstQuery = useRef(true)
  useEffect(() => {
    if (firstQuery.current) { firstQuery.current = false; return }
    move(0)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  async function open(keyboard: boolean) {
    setQuery('')
    await pop.show({ keyboard })
    const all = [...pinned, ...options.filter(o => !o.pinned)]
    const at = all.findIndex(o => o.value === model)
    move(at >= 0 ? at : 0, 1, all)
    ;(filtering ? input.current : list.current)?.focus({ preventScroll: true })
  }
  function pick(o: ComboOption | undefined, keyboard: boolean) {
    if (!o || o.disabled) return
    setModel(o.value)
    onSelect?.(o)
    pop.hide(true, keyboard)
  }
  function onTrigger(event: MouseEvent) {
    if (pop.open) pop.hide(false, event.detail === 0)
    else void open(event.detail === 0)
  }
  function onTriggerKey(event: KeyboardEvent) {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !pop.open) {
      event.preventDefault()
      void open(true)
    }
  }
  // With no filter, typing jumps to the option that starts with what was typed in the last half second.
  const typed = useRef({ text: '', at: 0 })
  function onKey(event: KeyboardEvent) {
    const k = event.key
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      event.preventDefault()
      move(active + (k === 'ArrowDown' ? 1 : -1), k === 'ArrowDown' ? 1 : -1)
    }
    else if ((k === 'Home' || k === 'End') && !filtering) {
      event.preventDefault()
      move(k === 'Home' ? 0 : visible.length - 1, k === 'Home' ? 1 : -1)
    }
    else if (k === 'Enter' || (k === ' ' && !filtering)) {
      event.preventDefault()
      pick(visible[active], true)
    }
    else if (!filtering && k.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = Date.now()
      typed.current.text = now - typed.current.at > 500 ? k.toLowerCase() : typed.current.text + k.toLowerCase()
      typed.current.at = now
      const i = visible.findIndex(o => !o.disabled && o.label.toLowerCase().startsWith(typed.current.text))
      if (i >= 0) move(i)
    }
  }
  const activeId = pop.open && visible.length ? optionId(active) : undefined

  return (
    <>
      <style href="ds-combobox" precedence="ds">{css}</style>
      <button
        data-ds={ds}
        {...attrs}
        ref={(el) => { pop.anchor.current = el }}
        type="button"
        className={triggerClass ?? 'group inline-flex h-control-md w-full min-w-0 cursor-pointer items-center gap-2 border border-edge-strong bg-surface px-2.5 text-left text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard focus-visible:border-edge-focus aria-expanded:border-edge-focus disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch'}
        aria-haspopup="listbox"
        aria-expanded={pop.open}
        aria-controls={pop.open ? `${id}-list` : undefined}
        aria-label={label}
        disabled={disabled}
        onClick={onTrigger}
        onKeyDown={onTriggerKey}
      >
        {trigger
          ? trigger({ selected, open: pop.open })
          : (
              <>
                <span className={selected ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate text-fg-muted'}>{selected?.label ?? placeholder}</span>
                <ChevronsUpDown size={12} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
              </>
            )}
      </button>
      <PopoverPanel data-ds="combobox" pop={pop} className="flex flex-col p-1" style={{ width }}>
        {filtering && (
          <label className="relative mb-1 block">
            <Search size={12} strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
            <input
              ref={input}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="h-control-sm w-full border border-edge-strong bg-surface pr-2.5 pl-7 text-meta text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus max-md:h-control-touch max-md:text-input"
              role="combobox"
              aria-label={filterLabel}
              placeholder={filterLabel}
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-activedescendant={activeId}
              autoComplete="off"
              spellCheck={false}
              onKeyDown={onKey}
            />
          </label>
        )}
        <div
          id={`${id}-list`}
          ref={list}
          role="listbox"
          aria-label={label}
          tabIndex={filtering ? -1 : 0}
          aria-activedescendant={filtering ? undefined : activeId}
          className="flex max-h-65 flex-col overflow-y-auto outline-none"
          onKeyDown={onKey}
        >
          {visible.map((o, i) => (
            <Fragment key={`${o.pinned ? 'p' : 'o'}-${o.value}`}>
              {i === pinned.length && pinned.length > 0 && rest.length > 0 && <div className="-mx-1 my-1 h-px shrink-0 bg-edge" role="separator" />}
              <div
                id={optionId(i)}
                role="option"
                className="ds-option"
                aria-selected={o.value === model}
                aria-disabled={o.disabled || undefined}
                data-active={i === active || undefined}
                onPointerMove={() => { if (!o.disabled) setActive(i) }}
                onMouseDown={e => e.preventDefault()}
                onClick={() => pick(o, false)}
              >
                {option
                  ? option({ option: o, selected: o.value === model })
                  : (
                      <>
                        <span className="min-w-0 flex-1 truncate">{o.label}</span>
                        {o.hint && <span className="min-w-10 text-right text-meta text-fg-muted tabular-nums">{o.hint}</span>}
                        <Check size={14} strokeWidth={1.5} className={o.value !== model ? 'shrink-0 invisible' : 'shrink-0'} aria-hidden="true" />
                      </>
                    )}
              </div>
            </Fragment>
          ))}
          {!rest.length && query && <p className="px-3.5 py-2 type-meta text-fg-muted">{empty ? empty(query) : `Nothing matches "${query}".`}</p>}
        </div>
      </PopoverPanel>
    </>
  )
}

export default Combobox

const css = `
/* A row of a listbox: Menu's row (console2.css .v2-menu-item). The highlight follows the arrows and the pointer alike,
   as in the command palette, so hover itself draws nothing. */
.ds-option { position: relative; display: flex; height: var(--ds-size-control-md); flex-shrink: 0; align-items: center; gap: var(--ds-space-md); padding: 0 10px 0 14px; color: var(--ds-color-fg); font-size: var(--ds-text-ui); cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-option::before { position: absolute; top: 50%; left: 5px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-option[data-active] { background: var(--ds-color-surface-subtle); }
.ds-option[data-active]::before { opacity: 1; }
.ds-option[aria-disabled="true"] { color: var(--ds-color-fg-muted); cursor: not-allowed; }
@media (pointer: coarse), (max-width: 767px) { .ds-option { height: auto; min-height: 44px; } }
`
