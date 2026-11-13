'use client'
import { Fragment, useEffect, useRef } from 'react'
import { Check, ListFilter } from 'lucide-react'
import { Menu } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// Every filter in one menu from the search box's bar (search/FilterMenu.vue): the scope chip's button (.v2-scope)
// reading Filters, with a count on ink (.v2-filter-count) once any is on, and a 240px menu of radio groups, each
// under its label. A second press on what is chosen clears it; the menu stays open for the next pick. Vue's v-model is
// `value` with `onValueChange` (or `defaultValue` alone): each group's key to its value ('' or 0 for none).
export interface FilterGroup { key: string, label: string, options: Array<{ value: string | number, label: string }> }
export type FilterValues = Record<string, string | number>
export interface FilterMenuProps { groups: FilterGroup[], value?: FilterValues, defaultValue?: FilterValues, onValueChange?: (value: FilterValues) => void }

export function FilterMenu({ groups, value, defaultValue = {}, onValueChange }: FilterMenuProps) {
  const [model, setModel] = useControllable<FilterValues>(value, defaultValue, onValueChange)
  const count = groups.filter(g => model[g.key]).length
  function pick(key: string, v: string | number) {
    setModel({ ...model, [key]: model[key] === v ? (typeof v === 'number' ? 0 : '') : v })
  }

  // Vue's data-ds falls through to Menu's root, and role and aria-checked to each MenuItem's button; React's Menu and
  // MenuItem take neither yet (data-ds is passed for when they do), so the root is renamed once drawn and the rows are
  // made radios as they are drawn and as the picks change.
  const glyph = useRef<SVGSVGElement | null>(null)
  const checked = useRef<boolean[]>([])
  checked.current = groups.flatMap(g => g.options.map(o => model[g.key] === o.value))
  const radios = () => {
    const root = glyph.current?.closest('[data-ds="filter-menu"], [data-ds="menu"]')
    root?.querySelectorAll('[role="menu"] .ds-menu-item').forEach((row, i) => {
      row.setAttribute('role', 'menuitemradio')
      row.setAttribute('aria-checked', String(!!checked.current[i]))
    })
  }
  useEffect(() => {
    const root = glyph.current?.closest('[data-ds="menu"]')
    if (!root) return
    root.setAttribute('data-ds', 'filter-menu')
    const drawn = new MutationObserver(radios)
    drawn.observe(root, { childList: true, subtree: true })
    return () => drawn.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(radios)

  return (
    <Menu
      data-ds="filter-menu"
      label="filters"
      width="240px"
      triggerClass="inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-edge bg-surface-subtle px-2 text-meta text-fg transition-[border-color] duration-120 ease-standard hover:border-edge-focus aria-expanded:border-edge-focus aria-expanded:bg-surface active:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-edge-focus"
      trigger={(
        <>
          <ListFilter ref={glyph} size={12} strokeWidth={1.5} className="text-fg-muted" aria-hidden="true" />
          Filters{count > 0 && <span className="inline-flex h-4 min-w-4 items-center justify-center bg-surface-inverse px-1 text-caption leading-4 text-fg-inverse tabular-nums">{count}</span>}
        </>
      )}
    >
      <div className="flex max-h-88 flex-col overflow-y-auto">
        {groups.map((g, i) => (
          <Fragment key={g.key}>
            {i > 0 && <MenuSeparator />}
            <MenuLabel>{g.label}</MenuLabel>
            <div role="group" aria-label={g.label} className="flex flex-col">
              {g.options.map(o => (
                <MenuItem key={o.value} keepOpen onSelect={() => pick(g.key, o.value)}>
                  <span className="min-w-0 flex-1 truncate text-left">{o.label}</span>
                  <Check size={14} strokeWidth={1.5} className={cn('shrink-0', model[g.key] !== o.value && 'invisible')} aria-hidden="true" />
                </MenuItem>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </Menu>
  )
}

export default FilterMenu
