'use client'
import type { ReactNode } from 'react'
import { useControllable } from '@/react/hooks/useControllable'

// A pressable chip that stays on (console2.css .v2-chip.v2-chip-pick with aria-pressed): 28px, a hairline, 12px, and a
// 4px red square at its start that shows on hover and stays while it is on, when the edge also turns ink. A press
// gives the paper fill. For one setting that is on or off in a row of filters or options; a few that exclude each other
// are a ToggleGroup. 40px on phones. Vue's v-model is `pressed` with `onPressedChange` (or `defaultPressed` alone).
export interface ToggleProps {
  disabled?: boolean
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  className?: string
  children?: ReactNode
}

export function Toggle({ disabled, pressed, defaultPressed = false, onPressedChange, className, children }: ToggleProps) {
  const [on, setOn] = useControllable(pressed, defaultPressed, onPressedChange)
  return (
    <>
      <style href="ds-toggle" precedence="ds">{css}</style>
      <button data-ds="toggle" type="button" className={className ? `ds-toggle ${className}` : 'ds-toggle'} aria-pressed={on} disabled={disabled} onClick={() => setOn(!on)}>{children}</button>
    </>
  )
}

export default Toggle

const css = `
.ds-toggle { position: relative; display: inline-flex; height: var(--ds-size-control-sm); align-items: center; gap: var(--ds-space-sm); padding: 0 10px 0 16px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-meta); white-space: nowrap; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-toggle::before { position: absolute; top: 50%; left: 6px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-toggle[aria-pressed="true"] { border-color: var(--ds-color-edge-focus); }
.ds-toggle[aria-pressed="true"]::before { opacity: 1; }
@media (hover: hover) and (pointer: fine) {
  .ds-toggle:hover:not(:disabled) { border-color: var(--ds-color-action-secondary-edge-hover); }
  .ds-toggle:hover:not(:disabled)::before { opacity: 1; }
}
.ds-toggle:active:not(:disabled) { background: var(--ds-color-surface-subtle); }
.ds-toggle:disabled { color: var(--ds-color-fg-muted); cursor: not-allowed; }
.ds-toggle svg { flex-shrink: 0; }
@media (pointer: coarse), (max-width: 767px) { .ds-toggle { height: auto; min-height: var(--ds-size-control-touch); padding-block: 6px; font-size: var(--ds-text-ui); } }
`
