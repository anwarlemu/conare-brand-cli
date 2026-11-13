import type { Ref, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/react/lib/cn'

// The browser's own select, drawn as the console's field (main.css select.c-input, square under the console): 32px (28px
// with `small`), 13px, the #C3C1BF hairline that darkens on hover and turns to a 2px ink edge on focus, and its own 12px
// chevron in the muted grey, the same in every browser. 40px and 16px on phones, where the system picker opens. Options
// go in as <option> children. For a pick with search or marks, use Menu. `className` lands on the wrapper, every other
// prop on the <select> (value and onChange as React's own), as Vue's attributes do.
export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  small?: boolean
  invalid?: boolean
  mono?: boolean
  ref?: Ref<HTMLSelectElement>
}

export function NativeSelect({ small, invalid, mono, className, children, ...rest }: NativeSelectProps) {
  return (
    <>
      <style href="ds-native-select" precedence="ds">{css}</style>
      <span data-ds="native-select" className={cn('ds-select', className)} data-small={small || undefined}>
        <select {...rest} aria-invalid={invalid || undefined} className={mono ? 'font-code' : undefined}>{children}</select>
        <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
      </span>
    </>
  )
}

export default NativeSelect

const css = `
.ds-select { position: relative; display: inline-flex; width: 100%; align-items: center; }
.ds-select > select { width: 100%; height: var(--ds-size-control-md); padding: 0 32px 0 12px; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); appearance: none; cursor: pointer; transition: border-color var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-select > svg { position: absolute; right: 12px; color: var(--ds-color-fg-muted); pointer-events: none; }
@media (hover: hover) and (pointer: fine) { .ds-select > select:hover:not(:disabled, :focus) { border-color: var(--ds-color-neutral-500); } }
.ds-select > select:focus { padding: 0 calc(32px - 1px) 0 calc(12px - 1px); border: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline: none; }
.ds-select > select[aria-invalid="true"] { border-color: var(--ds-color-action-danger); }
.ds-select > select:disabled { border-color: var(--ds-color-edge); color: var(--ds-color-fg-muted); cursor: not-allowed; }
.ds-select[data-small] { width: auto; }
.ds-select[data-small] > select { height: var(--ds-size-control-sm); padding: 0 28px 0 8px; font-size: var(--ds-text-meta); }
.ds-select[data-small] > select:focus { padding: 0 calc(28px - 1px) 0 calc(8px - 1px); }
.ds-select[data-small] > svg { right: 8px; }
@media (pointer: coarse), (max-width: 767px) { .ds-select > select, .ds-select[data-small] > select { height: var(--ds-size-control-touch); font-size: var(--ds-text-input); } }
`
