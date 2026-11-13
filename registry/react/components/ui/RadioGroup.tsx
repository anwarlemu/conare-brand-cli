'use client'
import { useId } from 'react'
import { useControllable } from '@/react/hooks/useControllable'

// One of a few, all in view (new, in the console's grammar): square 16px boxes in the #C3C1BF hairline, an ink 8px
// square inside the picked one (it settles in from 0.6 in 120ms; reduced motion fades it), rows 28px (40px on phones)
// with a 13px label and an optional muted hint. Arrows move the pick, as native radios do; focus is the switch's red
// outline. More than five options is a NativeSelect or a Menu; two views of one thing are Tabs. Vue's v-model is
// `value` with `onValueChange` (or `defaultValue` alone).
export interface RadioOption<T extends string> { value: T, label: string, hint?: string, disabled?: boolean }
export interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[]
  label: string
  name?: string
  inline?: boolean
  disabled?: boolean
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  className?: string
}

export function RadioGroup<T extends string>({ options, label, name: given, inline, disabled, value, defaultValue, onValueChange, className }: RadioGroupProps<T>) {
  const [model, setModel] = useControllable<T | undefined>(value, defaultValue, v => v !== undefined && onValueChange?.(v))
  const auto = useId()
  const name = given ?? `radio-${auto}`
  return (
    <>
      <style href="ds-radio-group" precedence="ds">{css}</style>
      <div data-ds="radio-group" role="radiogroup" aria-label={label} className={className ? `ds-radios ${className}` : 'ds-radios'} data-inline={inline || undefined}>
        {options.map(o => (
          <label key={o.value} className="ds-radiorow" data-disabled={disabled || o.disabled || undefined}>
            <span className="ds-radio"><input type="radio" name={name} value={o.value} checked={model === o.value} onChange={() => setModel(o.value)} disabled={disabled || o.disabled} aria-describedby={o.hint ? `${name}-${o.value}` : undefined} /><i aria-hidden="true" /></span>
            <span className="flex min-w-0 flex-col">
              <span>{o.label}</span>
              {o.hint && <span id={`${name}-${o.value}`} className="type-meta text-fg-muted">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </>
  )
}

export default RadioGroup

const css = `
.ds-radios { display: flex; flex-direction: column; }
.ds-radios[data-inline] { flex-direction: row; flex-wrap: wrap; column-gap: var(--ds-space-xl); }
.ds-radiorow { display: inline-flex; min-height: var(--ds-size-control-sm); align-items: flex-start; gap: var(--ds-space-md); padding-block: 4px; color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); cursor: pointer; }
.ds-radiorow[data-disabled] { color: var(--ds-color-fg-muted); cursor: not-allowed; }
.ds-radio { display: inline-grid; width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; place-items: center; }
.ds-radio > * { grid-area: 1 / 1; }
.ds-radio > input { width: 16px; height: 16px; margin: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); appearance: none; cursor: inherit; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-radio > input:checked { border-color: var(--ds-color-edge-focus); }
.ds-radio > input:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
.ds-radio > input:disabled { border-color: var(--ds-color-edge); background: var(--ds-color-surface-sunken); }
.ds-radio > i { width: 8px; height: 8px; background: var(--ds-color-action-primary); opacity: 0; pointer-events: none; transform: scale(0.6); transition: opacity var(--ds-duration-micro) var(--ds-easing-standard), transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-radio > input:checked + i { opacity: 1; transform: none; }
.ds-radio > input:disabled + i { background: var(--ds-color-fg-muted); }
@media (hover: hover) and (pointer: fine) { .ds-radiorow:hover > .ds-radio > input:not(:disabled, :checked) { border-color: var(--ds-color-edge-focus); } }
@media (pointer: coarse), (max-width: 767px) { .ds-radiorow { min-height: var(--ds-size-control-touch); align-items: center; padding-block: 8px; font-size: var(--ds-text-body); } .ds-radio { margin-top: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-radio > i { transform: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); } }
`
