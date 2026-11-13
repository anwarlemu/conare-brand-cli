'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import { useControllable } from '@/react/hooks/useControllable'

// A whole in parts, as Billing's prices draw it (the chart's Split example): one bar, the parts in the order given
// (largest first), the picked part in ink with a red mark gliding over it; under it the parts as rows in a card, one
// paper block gliding to the row under the pointer or focus, and a red square on the picked row. Pointing at a row
// picks it (`value` / `defaultValue` / `onValueChange`, Vue's v-model). `detail` is a quiet middle column, hidden on
// phones; `display` is the value as written.
export type SplitPart = { name: string, value: number, display?: string, detail?: string }

export interface SplitBarProps {
  parts: SplitPart[]
  label?: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}

export function SplitBar({ parts, label, value, defaultValue = 0, onValueChange }: SplitBarProps) {
  const [at, setAt] = useControllable(value, defaultValue, onValueChange)
  const total = parts.reduce((a, p) => a + p.value, 0) || 1
  // The parts share what the bar's 2px gaps leave, so those come out of the percent.
  const n = parts.length
  const i = Math.min(at, n - 1)
  const middle = (parts.slice(0, i).reduce((a, p) => a + p.value, 0) + (parts[i]?.value ?? 0) / 2) / total
  const center = `calc(${middle * 100}% + ${i * 2 - middle * 2 * (n - 1)}px)`

  // The gliding block: placed at once the first time, then it glides on transform.
  const list = useRef<HTMLUListElement | null>(null)
  const [mark, setMark] = useState<{ y: number, h: number } | null>(null)
  const [instant, setInstant] = useState(true)
  const had = useRef(false)
  function place(k: number) {
    const row = list.current?.querySelectorAll<HTMLElement>('[data-glide-row]')[k]
    if (!row) return
    setInstant(!had.current)
    had.current = true
    setMark({ y: row.offsetTop, h: row.offsetHeight })
  }
  function pick(k: number) {
    setAt(k)
    place(k)
  }
  useLayoutEffect(() => place(at), [at]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-ds="split-bar" className="flex flex-col gap-4">
      <style href="ds-split-bar" precedence="ds">{css}</style>
      <div className="ds-segmark-track" aria-hidden="true"><span className="ds-segmark" style={{ transform: `translateX(${center})` }}><i /></span></div>
      <div className="ds-splitbar" aria-hidden="true">
        {parts.map((p, k) => <span key={p.name} data-on={at === k || undefined} style={{ flexGrow: p.value / total }} />)}
      </div>
      <ul ref={list} className="relative border border-edge bg-surface" aria-label={label}>
        {mark && <span className="ds-rowmark" data-instant={instant || undefined} style={{ transform: `translateY(${mark.y}px)`, height: `${mark.h}px` }} aria-hidden="true" />}
        {parts.map((p, k) => (
          <li key={p.name} data-glide-row="" className="border-edge [&+&]:border-t">
            <button type="button" className="ds-priced" data-on={at === k || undefined} aria-pressed={at === k} onPointerEnter={() => pick(k)} onFocus={() => pick(k)} onClick={() => pick(k)}>
              <span className="min-w-0 flex-1 truncate text-left">{p.name}</span>
              {p.detail && <span className="hidden text-fg-muted tabular-nums sm:inline">{p.detail}</span>}
              <span className="w-24 text-right tabular-nums">{p.display ?? p.value.toLocaleString('en-US')}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SplitBar

const css = `
/* console2.css .v2-splitbar, .v2-segmark, .v2-rowmark and .v2-priced, as Billing's prices set them (data-pm="6"). */
.ds-splitbar { display: flex; height: 12px; gap: var(--ds-space-2xs); margin-top: var(--ds-space-xs); }
.ds-splitbar > span { flex-basis: 0; background: var(--ds-color-neutral-600); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-splitbar > span[data-on] { background: var(--ds-color-surface-inverse); }
.ds-segmark-track { position: relative; height: 8px; margin-bottom: -12px; overflow: clip; }
.ds-segmark { position: absolute; inset: 0; transition: transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-segmark i { position: absolute; top: 0; left: -3px; width: 6px; height: 6px; background: var(--ds-color-edge-accent); }
.ds-rowmark { position: absolute; top: 0; right: 0; left: 0; z-index: 0; background: var(--ds-color-surface-subtle); pointer-events: none; transition: transform var(--ds-duration-enter) var(--ds-easing-out), height var(--ds-duration-enter) var(--ds-easing-out); }
.ds-rowmark[data-instant] { transition: none; }
.ds-priced { position: relative; z-index: 1; display: flex; width: 100%; min-height: var(--ds-size-row); align-items: center; gap: var(--ds-space-xl); padding: 0 16px 0 20px; font-size: var(--ds-text-ui); cursor: pointer; }
.ds-priced::before { position: absolute; top: 50%; left: 8px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); content: ""; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-priced[data-on]::before { opacity: 1; }
.ds-priced:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
@media (prefers-reduced-motion: reduce) { .ds-splitbar > span, .ds-segmark, .ds-rowmark { transition: none; } }
`
