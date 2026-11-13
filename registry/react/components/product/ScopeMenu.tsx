'use client'
import { Check, ChevronDown, Database, Layers } from 'lucide-react'
import { Combobox, type ComboOption } from '@/react/components/ui/Combobox'

// Where a search looks (ScopeMenu.vue): every namespace, or one. The button is the search bar's 28px chip (.v2-scope:
// a hairline on the paper, ink under the pointer and while open), the namespace in mono once one is picked, a 12px
// chevron that turns over as it opens. The 288px panel lists Every namespace over a hairline, then each namespace with
// its mark (its app's logo, or `ownMark` for a namespace written by API or upload), its name in mono and its size, the
// pick checked; a filter shows past six. `single`: a namespace must be chosen, so there is no Every namespace. On
// Combobox: arrows, typing, Enter and Escape. v-model is `value` with `onValueChange` (or `defaultValue`).
export interface ScopeOption { name: string, documents: number, logo?: string | null }
export interface ScopeMenuProps { options: ScopeOption[], single?: boolean, ownMark?: string, value?: string, defaultValue?: string, onValueChange?: (value: string) => void }

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function ScopeMenu({ options, single, ownMark, value, defaultValue = '', onValueChange }: ScopeMenuProps) {
  const total = options.reduce((a, o) => a + o.documents, 0)
  const list: ComboOption[] = [
    ...(single ? [] : [{ value: '', label: 'Every namespace', hint: compact.format(total), pinned: true }]),
    ...options.map(o => ({ value: o.name, label: o.name, hint: compact.format(o.documents) })),
  ]
  const logoOf = (name: string | number | undefined) => options.find(o => o.name === name)?.logo ?? null
  return (
    <Combobox
      data-ds="scope-menu"
      value={value}
      defaultValue={defaultValue}
      onValueChange={v => onValueChange?.(String(v))}
      options={list}
      label={single ? 'add to' : 'search in'}
      filter="auto"
      filterLabel="Filter namespaces"
      width="288px"
      disabled={!options.length}
      triggerClass="group inline-flex h-control-sm max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui cursor-pointer items-center gap-1.5 border border-edge bg-surface-subtle px-2 text-meta text-fg transition-[border-color] duration-120 ease-standard hover:border-edge-focus aria-expanded:border-edge-focus aria-expanded:bg-surface active:enabled:bg-surface-subtle disabled:cursor-not-allowed disabled:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-edge-focus"
      trigger={({ selected }) => {
        const scope = selected?.value ?? ''
        const logo = logoOf(scope)
        const label = scope || (single ? 'Choose a namespace' : 'every namespace')
        return (
          <>
            {logo ? <img src={logo} alt="" width={12} height={12} className="size-3 object-contain" /> : <Database size={12} strokeWidth={1.5} className="text-fg-muted" aria-hidden="true" />}
            <span className="sr-only">{single ? 'add to' : 'search in'}</span>
            <span className={scope ? 'max-w-45 truncate type-code-sm' : 'max-w-45 truncate'}>{label}</span>
            <ChevronDown size={12} strokeWidth={1.5} className="text-fg-muted transition-[rotate] duration-120 ease-out group-aria-expanded:rotate-180 group-aria-expanded:duration-180 motion-reduce:transition-none" aria-hidden="true" />
          </>
        )
      }}
      option={({ option, selected }) => {
        const logo = logoOf(option.value)
        return (
          <>
            {option.pinned
              ? <Database size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
              : logo
                ? <img src={logo} alt="" width={14} height={14} className="size-3.5 shrink-0 object-contain" />
                : ownMark
                  ? <img src={ownMark} alt="" width={14} height={14} className="size-3.5 shrink-0 object-contain" />
                  : <Layers size={14} strokeWidth={1.5} className="shrink-0 text-fg" aria-hidden="true" />}
            <span className={option.pinned ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate type-code-sm'}>{option.label}</span>
            <span className="min-w-10 text-right text-meta text-fg-muted tabular-nums">{option.hint}</span>
            <Check size={14} strokeWidth={1.5} className={selected ? 'shrink-0' : 'shrink-0 invisible'} aria-hidden="true" />
          </>
        )
      }}
      empty={query => `No namespace matches "${query}".`}
    />
  )
}

export default ScopeMenu
