'use client'
import { useEffect, useRef } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Menu } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// One filter as a menu button under the search box (search/FilterChip.vue, console2.css .v2-scope): "App", or
// "App: Slack" once chosen, with an ink edge while something is chosen or the menu is open. The menu is a radio list on
// Menu's panel, "Any" first (the empty value: '' or 0), a check on the pick. 28px, 40px on phones. Vue's v-model is
// `value` with `onValueChange` (or `defaultValue` alone).
export interface FilterChipProps<T extends string | number> {
  label: string
  any: string
  options: Array<{ value: T, label: string }>
  width?: string
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

export function FilterChip<T extends string | number>({ label, any, options, width = '200px', value, defaultValue, onValueChange }: FilterChipProps<T>) {
  const empty = (typeof options[0]?.value === 'number' ? 0 : '') as T
  const [model, setModel] = useControllable<T>(value, defaultValue ?? empty, onValueChange)
  const all = [{ value: empty, label: any }, ...options]
  const chosen = options.find(o => o.value === model)?.label ?? ''
  const trigger = [
    'inline-flex h-control-sm cursor-pointer items-center gap-1.5 border px-2 text-meta text-fg whitespace-nowrap transition-[border-color,background-color] duration-120 ease-standard',
    'hover:border-edge-focus active:bg-surface-subtle aria-expanded:border-edge-focus aria-expanded:bg-surface focus-visible:outline-offset-1',
    'max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui',
    chosen ? 'border-edge-focus bg-surface' : 'border-edge bg-surface-subtle',
  ].join(' ')

  // Vue's data-ds falls through to Menu's root, and role and aria-checked to each MenuItem's button; React's Menu and
  // MenuItem take neither yet (data-ds is passed for when they do), so the root is renamed once drawn and the rows are
  // made radios as they are drawn and as the pick changes.
  const chevron = useRef<SVGSVGElement | null>(null)
  const checked = useRef<boolean[]>([])
  checked.current = all.map(o => o.value === model)
  const radios = () => {
    const root = chevron.current?.closest('[data-ds="filter-chip"], [data-ds="menu"]')
    root?.querySelectorAll('[role="menu"] .ds-menu-item').forEach((row, i) => {
      row.setAttribute('role', 'menuitemradio')
      row.setAttribute('aria-checked', String(!!checked.current[i]))
    })
  }
  useEffect(() => {
    const root = chevron.current?.closest('[data-ds="menu"]')
    if (!root) return
    root.setAttribute('data-ds', 'filter-chip')
    const drawn = new MutationObserver(radios)
    drawn.observe(root, { childList: true, subtree: true })
    return () => drawn.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(radios)

  return (
    <Menu
      data-ds="filter-chip"
      label={label}
      width={width}
      triggerClass={trigger}
      trigger={open => (
        <>
          {label}{chosen && <>{': '}<span className="font-medium">{chosen}</span></>}
          <ChevronDown ref={chevron} size={12} strokeWidth={1.5} className={cn('text-fg-muted transition-[rotate] duration-120 ease-out motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true" />
        </>
      )}
    >
      <div className="flex max-h-75 flex-col overflow-y-auto">
        {all.map(o => (
          <MenuItem key={o.value} onSelect={() => setModel(o.value)}>
            <span className="min-w-0 flex-1 truncate">{o.label}</span>
            <Check size={14} strokeWidth={1.5} className={cn('shrink-0', model === o.value ? '' : 'invisible')} aria-hidden="true" />
          </MenuItem>
        ))}
      </div>
    </Menu>
  )
}

export default FilterChip
