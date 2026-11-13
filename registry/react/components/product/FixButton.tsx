'use client'
import { Check } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Count } from '@/react/components/ui/Count'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { usePixelGrid } from '@/react/hooks/usePixelGrid'

// The one button a fix needs, which then reports the fix itself, so the eye stays where it pressed
// (namespaces/FixButton.vue, console2.css .v2-fixbtn, .v2-states). At rest it is the website's dark button: on hover
// its red squares run across under the label. A press answers on pointer-down (scale 0.97) and calls `onPress`; the
// app then moves `state` along: signing (signing in), catching (the changes coming back, counted as they arrive), done
// (a check draws itself and the last count stays as the result). Every state is stacked in one cell, so nothing around
// it moves: labels leave up and arrive from below with a touch of blur. Once the source is back the black wipes off
// left to right on the strong ease-out (420ms), and since the label is printed on both layers it changes colour exactly
// at the edge. `tone="red"` is the same button the other way round (red, its squares running black), for a calm page.
// It is a rare action, so it may take a moment. Reduced motion keeps the fades only.
export type FixState = 'broken' | 'signing' | 'catching' | 'done'
const STEP: Record<FixState, number> = { broken: 0, signing: 1, catching: 2, done: 3 }

export interface FixButtonProps {
  state: FixState
  app: string
  count: number
  tone?: 'red'
  onPress?: () => void
}

const plain = (n: number) => n.toLocaleString('en-US')

export function FixButton({ state, app, count, tone, onPress }: FixButtonProps) {
  const [pulled, setPulled] = useState(count)
  useEffect(() => { if (count) setPulled(count) }, [count])
  const root = useRef<HTMLButtonElement | null>(null)
  const { grid, style } = usePixelGrid(root)
  const spoken = ({ broken: `Reconnect ${app}`, signing: `Signing in to ${app}`, catching: `${app} is syncing`, done: `${app} is up to date` })[state]
  return (
    <>
      <style href="ds-fix-button" precedence="ds">{css}</style>
      <button data-ds="fix-button" ref={root} type="button" className="ds-fix" data-state={state} data-tone={tone} style={{ '--s': STEP[state] } as CSSProperties} disabled={state !== 'broken'} aria-busy={state === 'signing' || state === 'catching'} aria-label={spoken} onClick={(e) => { e.stopPropagation(); onPress?.() }}>
        {(['text', 'ink'] as const).map(layer => (
          <span key={layer} className={`ds-states ds-fix-${layer}`} aria-hidden="true">
            {layer === 'ink' && grid && <span className="ds-fix-fill" style={style}>{grid.cells.map((c, k) => <i key={k} style={c} />)}</span>}
            <span style={{ '--n': 0 } as CSSProperties}>{`Reconnect ${app}`}</span>
            <span style={{ '--n': 1 } as CSSProperties}><DotMatrix tone={layer === 'ink' ? 'inverse' : 'default'} />Signing in</span>
            <span style={{ '--n': 2 } as CSSProperties}><DotMatrix tone={layer === 'ink' ? 'inverse' : 'default'} /><Count value={pulled} /> changes</span>
            <span style={{ '--n': 3 } as CSSProperties}><Check size={12} strokeWidth={2} aria-hidden="true" />{`${plain(pulled)} changes`}</span>
          </span>
        ))}
      </button>
    </>
  )
}

export default FixButton

const css = `
/* A thing moving through states in place: --s is the state, --n each label's. */
.ds-states { display: inline-grid; justify-items: start; vertical-align: top; }
.ds-states > :not(.ds-fix-fill) { --d: calc(var(--n) - var(--s)); grid-area: 1 / 1; opacity: clamp(0, calc(1 - var(--d) * var(--d)), 1); filter: blur(calc(clamp(0, calc(var(--d) * var(--d)), 1) * 2px)); transform: translateY(calc(clamp(-1, var(--d), 1) * 5px)); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-fix { position: relative; display: inline-grid; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; border: var(--ds-border-hairline) solid var(--ds-color-edge); color: var(--ds-color-fg); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); white-space: nowrap; cursor: pointer; transition: transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-fix:disabled { cursor: default; }
.ds-fix:active:not(:disabled) { transform: scale(0.97); }
.ds-fix:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
.ds-fix-text, .ds-fix-ink { display: grid; align-items: center; justify-items: center; padding: 0 10px; }
.ds-fix-text > :not(.ds-fix-fill), .ds-fix-ink > :not(.ds-fix-fill) { display: inline-flex; align-items: center; gap: var(--ds-space-sm); }
.ds-fix-ink { position: absolute; inset: -1px; isolation: isolate; overflow: hidden; background: var(--ds-color-action-primary); color: var(--ds-color-action-primary-fg); clip-path: inset(0 0 0 0); transition: clip-path var(--ds-duration-wipe) var(--ds-easing-out), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-fix:is([data-state="catching"], [data-state="done"]) .ds-fix-ink { clip-path: inset(0 0 0 100%); }
.ds-fix[data-tone="red"] { background: var(--ds-color-surface); }
.ds-fix[data-tone="red"] .ds-fix-ink { background: var(--ds-color-home-red-hover); color: var(--ds-color-off-white); }
.ds-fix-fill { position: absolute; inset: 0; z-index: -1; display: grid; pointer-events: none; }
.ds-fix-fill i { position: relative; background: var(--ds-color-edge-accent); font-style: normal; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard) calc(var(--o) * 1ms); }
.ds-fix[data-tone="red"] .ds-fix-fill i { background: var(--ds-color-surface-inverse); }
@media (hover: hover) and (pointer: fine) { .ds-fix[data-state="broken"]:hover .ds-fix-fill i { opacity: 1; transition: opacity var(--ds-duration-cell) var(--ds-easing-decelerate) calc(var(--i) * 1ms); } }
.ds-fix[data-state="broken"]:active .ds-fix-fill i { opacity: 1; transition: opacity var(--ds-duration-press) ease 0ms; }
.ds-fix:focus-visible .ds-fix-fill i { opacity: 1; }
.ds-fix svg path { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset var(--ds-duration-micro) ease; }
.ds-fix[data-state="done"] svg path { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-collapse) var(--ds-easing-out) 80ms; }
@media (pointer: coarse), (max-width: 767px) { .ds-fix { height: var(--ds-size-control-touch); font-size: var(--ds-text-ui); } }
@media (prefers-reduced-motion: reduce) {
  .ds-states > :not(.ds-fix-fill) { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
  .ds-fix-ink { transition: opacity var(--ds-duration-micro) ease; }
  .ds-fix:is([data-state="catching"], [data-state="done"]) .ds-fix-ink { clip-path: none; opacity: 0; }
  .ds-fix:active:not(:disabled) { transform: none; }
  .ds-fix svg path { stroke-dashoffset: 0; transition: none; }
  .ds-fix-fill i { transition-delay: 0ms !important; }
}
`
