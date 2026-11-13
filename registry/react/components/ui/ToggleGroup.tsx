'use client'
import { useControllable } from '@/react/hooks/useControllable'

// Buttons that stay pressed, on the segmented control's track (console2.css .v2-tabs with aria-pressed): a paper track in
// a hairline, each pressed one a white block with its own hairline. `multiple` lets several stay on (the value is an
// array); otherwise one at most, pressing it again lets it go, and where the browser has anchor positioning the white
// block glides to the pick in 180ms. For views of one thing use Tabs; this is for options that are on or off. Vue's
// v-model is `value` with `onValueChange` (or `defaultValue` alone).
export type ToggleGroupOption<T extends string> = T | { value: T, label: string, disabled?: boolean }
export interface ToggleGroupProps<T extends string> {
  options: readonly ToggleGroupOption<T>[]
  label: string
  multiple?: boolean
  value?: T | T[] | null
  defaultValue?: T | T[] | null
  onValueChange?: (value: T | T[] | null) => void
  className?: string
}

const norm = <T extends string>(o: ToggleGroupOption<T>) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })

export function ToggleGroup<T extends string>({ options, label, multiple, value, defaultValue = null, onValueChange, className }: ToggleGroupProps<T>) {
  const [model, setModel] = useControllable<T | T[] | null>(value, defaultValue, onValueChange)
  const on = (v: T) => (Array.isArray(model) ? model.includes(v) : model === v)
  function press(v: T) {
    if (multiple) {
      const list = Array.isArray(model) ? model : []
      setModel(list.includes(v) ? list.filter(x => x !== v) : [...list, v])
    }
    else setModel(model === v ? null : v)
  }
  return (
    <>
      <style href="ds-toggle-group" precedence="ds">{css}</style>
      <div data-ds="toggle-group" className={className ? `ds-toggles ${className}` : 'ds-toggles'} role="group" aria-label={label} data-multiple={multiple || undefined}>
        {options.map(norm).map(o => (
          <button key={o.value} type="button" aria-pressed={on(o.value)} disabled={o.disabled} onClick={() => press(o.value)}>{o.label}</button>
        ))}
      </div>
    </>
  )
}

export default ToggleGroup

const css = `
.ds-toggles { display: inline-flex; padding: var(--ds-space-2xs); border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); }
.ds-toggles > button { height: var(--ds-size-control-xs); padding: 0 8px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); cursor: pointer; transition: color var(--ds-duration-glide) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-toggles > button:active:not(:disabled) { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) { .ds-toggles > button:hover { color: var(--ds-color-fg); } }
.ds-toggles > button:disabled { color: var(--ds-color-fg-faint); cursor: not-allowed; }
.ds-toggles > button[aria-pressed="true"] { position: relative; z-index: 1; background: var(--ds-color-surface); color: var(--ds-color-fg); outline: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-toggles > button[aria-pressed="true"]:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); }
/* Two pressed side by side keep a gap between their blocks. */
.ds-toggles[data-multiple] { gap: var(--ds-space-2xs); }
@supports (anchor-scope: all) {
  .ds-toggles:not([data-multiple]) { position: relative; anchor-scope: --ds-toggle-thumb; }
  .ds-toggles:not([data-multiple])::before { position: absolute; top: anchor(top); right: anchor(right); bottom: anchor(bottom); left: anchor(left); background: var(--ds-color-surface); content: ""; outline: var(--ds-border-hairline) solid var(--ds-color-edge); position-anchor: --ds-toggle-thumb; }
  .ds-toggles:not([data-multiple]):is(:hover, :focus-within)::before { transition: top var(--ds-duration-slide) var(--ds-easing-out), right var(--ds-duration-slide) var(--ds-easing-out), bottom var(--ds-duration-slide) var(--ds-easing-out), left var(--ds-duration-slide) var(--ds-easing-out); }
  .ds-toggles:not([data-multiple]):not(:has(> [aria-pressed="true"]))::before { content: none; }
  .ds-toggles:not([data-multiple]) > button { position: relative; z-index: 1; }
  .ds-toggles:not([data-multiple]) > button[aria-pressed="true"] { anchor-name: --ds-toggle-thumb; background: none; outline: 0; }
  .ds-toggles:not([data-multiple]) > button[aria-pressed="true"]:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); }
}
@media (pointer: coarse), (max-width: 767px) {
  .ds-toggles > button { position: relative; height: 34px; padding-inline: 12px; font-size: var(--ds-text-ui); }
  .ds-toggles > button::after { position: absolute; inset: -3px 0; content: ""; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-toggles:is(:hover, :focus-within)::before { transition: none; }
  .ds-toggles > button:active:not(:disabled) { transform: none; }
}
`
