'use client'
import { useControllable } from '@/react/hooks/useControllable'

// Line tabs for a page's sections (console2.css .v2-tabline): 13px muted labels 24px apart over a hairline; the current
// one in ink with a 2px ink underline and a 4px red square before it, which also shows under the pointer. Vue's v-model
// is `value` with `onValueChange` (or `defaultValue` alone).
export interface LineTabsProps<T extends string> {
  options: readonly (T | { value: T, label: string })[]
  label: string
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  className?: string
}

const norm = <T extends string>(o: T | { value: T, label: string }) => (typeof o === 'string' ? { value: o, label: o } : o)

export function LineTabs<T extends string>({ options, label, value, defaultValue, onValueChange, className }: LineTabsProps<T>) {
  const [current, setCurrent] = useControllable<T | undefined>(value, defaultValue, v => v !== undefined && onValueChange?.(v))
  return (
    <>
      <style href="ds-line-tabs" precedence="ds">{css}</style>
      <div data-ds="line-tabs" className={className ? `ds-tabline ${className}` : 'ds-tabline'} role="tablist" aria-label={label}>
        {options.map(norm).map(o => <button key={o.value} type="button" role="tab" aria-selected={current === o.value} onClick={() => setCurrent(o.value)}>{o.label}</button>)}
      </div>
    </>
  )
}

export default LineTabs

const css = `
.ds-tabline { display: flex; gap: var(--ds-space-2xl); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-tabline > button { position: relative; display: flex; height: var(--ds-size-control-lg); flex-shrink: 0; align-items: center; color: var(--ds-color-fg-muted); font-size: var(--ds-text-ui); cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-tabline > button:hover { color: var(--ds-color-fg); } }
.ds-tabline > [aria-selected="true"] { color: var(--ds-color-fg); }
.ds-tabline > [aria-selected="true"]::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--ds-color-surface-inverse); content: ""; }
.ds-tabline > button::before { position: absolute; top: 50%; left: -10px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); opacity: 0; content: ""; transition: opacity var(--ds-duration-micro) ease-out; }
.ds-tabline > [aria-selected="true"]::before { opacity: 1; }
@media (hover: hover) and (pointer: fine) { .ds-tabline > button:hover::before { opacity: 1; } }
@media (pointer: coarse), (max-width: 767px) { .ds-tabline > button { min-height: 44px; } }
`
