import type { CSSProperties, ReactNode } from 'react'
import { CellBurst } from '@/react/components/visuals/CellBurst'
import { Grain } from '@/react/components/visuals/Grain'

// A page whose job is one action with a visible result (SetupStep.vue, console2.css .v2-agentwork): the step's card
// beside the dark panel in the website's double rule, side by side from 640px of room. The card has the title in
// Faculty Glyphic with a red full stop, one line, and its action at the foot (children: one large PixelButton,
// secondary buttons beside it). The panel is the grain and a sheet of cells (`seed`) with one window on it (`window`), which plays once. Title, line and action rise in once, a blur clearing. `tall` keeps the panel at 372px, as
// Getting started's steps do, so moving between steps moves nothing.
export interface WorkPanelProps {
  title: string
  line?: string
  seed?: number
  tall?: boolean
  label?: string
  /** The one window on the panel (Vue's `window` slot). */
  window?: ReactNode
  children?: ReactNode
}

export function WorkPanel({ title, line, seed = 5, tall, label, window: win, children }: WorkPanelProps) {
  return (
    <>
      <style href="ds-work-panel" precedence="ds">{css}</style>
      <div data-ds="work-panel" className="ds-work">
        <section className="ds-work-grid" aria-label={label}>
          <div className="ds-work-card">
            <h2 className="ds-work-title ds-work-rise">{title}<span className="text-fg-accent-display">.</span></h2>
            {line && <p className="ds-work-line ds-work-rise" style={{ '--i': 1 } as CSSProperties}>{line}</p>}
            {children && <div className="ds-work-act ds-work-rise" style={{ '--i': 2 } as CSSProperties}>{children}</div>}
          </div>
          <div aria-hidden="true" className="ds-work-panel" data-tall={tall || undefined}>
            <Grain />
            <div className="pointer-events-none absolute inset-0 opacity-70"><CellBurst seed={seed} /></div>
            <div className="relative flex w-full items-center justify-center px-4 py-6">{win}</div>
          </div>
        </section>
      </div>
    </>
  )
}

export default WorkPanel

const css = `
.ds-work { container-type: inline-size; }
.ds-work-grid { position: relative; display: grid; gap: 1px; margin: calc(var(--ds-space-xs) + var(--ds-border-hairline)); border: var(--ds-border-hairline) solid var(--ds-color-edge); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; background: var(--ds-color-edge); }
@container (min-width: 640px) { .ds-work-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); } }
.ds-work-card { display: flex; flex-direction: column; align-items: flex-start; gap: var(--ds-space-md); padding: 20px; background: var(--ds-color-surface); }
.ds-work-title { font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-2); font-weight: var(--ds-font-weight-regular); line-height: var(--ds-text-heading-2-leading); letter-spacing: var(--ds-tracking-tight); text-wrap: balance; }
.ds-work-line { max-width: 56ch; color: var(--ds-color-fg-muted); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); text-wrap: pretty; }
.ds-work-act { display: flex; width: 100%; flex-wrap: wrap; align-items: center; gap: var(--ds-space-md); margin-top: auto; padding-top: var(--ds-space-xl); }
.ds-work-act > button:not(.ds-px), .ds-work-act > a:not(.ds-px) { height: var(--ds-size-control-lg); padding: 0 12px; font-size: var(--ds-text-ui); }
.ds-work-panel { position: relative; display: flex; min-height: 240px; align-items: center; overflow: hidden; background: var(--ds-color-neutral-200); color: var(--ds-color-neutral-300); }
@container (min-width: 640px) { .ds-work-panel[data-tall] { min-height: 372px; } }
/* Once, as the step opens: up 12px, a 3px blur clearing (.v2-agent-rise). */
.ds-work-rise { animation: ds-work-rise var(--ds-duration-step-rise) var(--ds-easing-out) both; animation-delay: calc(var(--i, 0) * 40ms); }
@keyframes ds-work-rise { from { opacity: 0; filter: blur(3px); transform: translateY(12px); } }
@media (pointer: coarse), (max-width: 767px) { .ds-work-act > :is(button, a) { height: var(--ds-size-control-touch); } }
@media (prefers-reduced-motion: reduce) { .ds-work-rise { animation-name: ds-work-fade; } }
@keyframes ds-work-fade { from { opacity: 0; } }
`
