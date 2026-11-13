import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The website's agent at work (HomeStepViz's last window), large, as the agents page opens it: the ask, what was
// added to context, then what the agent did, one under the other, in the dark code window. It plays once as it
// renders (the card settles in, each line rises 8px on its own beat, "Thinking" shimmers until it turns to "Worked
// for 1s"); reduced motion shows the end at once. The words come through props; `mark` replaces the brand mark.
export interface AgentWindowProps { title?: string, tag?: string, ask?: string, answer?: string, tool?: string, source?: string, mark?: ReactNode, className?: string }

const d = (n: number) => ({ '--d': n }) as CSSProperties

export function AgentWindow({ title = 'Your agent', tag = 'MCP', ask = 'How do refunds work?', answer = 'Refunds are available for 30 days.', tool = 'Search', source = 'Refunds', mark, className }: AgentWindowProps) {
  return (
    <>
      <style href="ds-agent-window" precedence="ds">{css}</style>
      <div data-ds="agent-window" className={cn('ds-agentwin w-full max-w-160', className)} data-play="">
        <div className="ds-agentwin-card">
          <div className="flex h-11 items-center gap-2 px-4 text-ui leading-4">
            {mark ?? <svg width="14" height="12" viewBox="0 0 149 134" fill="currentColor" className="h-3 w-auto shrink-0" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457Z" /> <path fillRule="evenodd" clipRule="evenodd" d="M0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799Z" /> <path fillRule="evenodd" clipRule="evenodd" d="M0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597Z" /> <path fillRule="evenodd" clipRule="evenodd" d="M0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692Z" /> <path fillRule="evenodd" clipRule="evenodd" d="M148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z" /></svg>}
            <span className="truncate">{title}</span>
            <span className="shrink-0 bg-ds-neutral-200 px-1.5 py-0.5 text-meta leading-4 text-code-fg tabular-nums">{tag}</span>
            <span className="ml-auto flex items-center gap-3 text-code-muted" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 7h8" /></svg>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 1h3v3M4 9H1V6M9 1 6 4M1 9l3-3" /></svg>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="m1.5 1.5 7 7m0-7-7 7" /></svg>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 px-5 pt-2 pb-7">
            <div className="min-w-0">
              <p className="ds-agentwin-in bg-ds-neutral-200 px-3 py-2 text-body" style={d(200)}>{ask}</p>
              <p className="ds-agentwin-in ds-agentwin-note mt-2" style={d(600)}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" /><rect x="3" y="3" width="3" height="6" fill="currentColor" /></svg>
                <span className="text-code-fg">Conare</span> added to context
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <p className="ds-agentwin-in ds-agentwin-note !grid" style={d(900)}>
                <span className="ds-agentwin-shimmer [grid-area:1/1]" style={d(2400)}>Thinking…</span>
                <span className="ds-agentwin-swap [grid-area:1/1]" style={d(2400)}>Worked for 1s</span>
              </p>
              <p className="ds-agentwin-in text-body leading-6" style={d(1300)}>Called <span className="ds-agentwin-chip">{tool}</span> in docs. {answer}</p>
              <p className="ds-agentwin-in ds-agentwin-note" style={d(2600)}>Source <span className="ds-agentwin-chip text-code-fg"><span className="size-1.5 shrink-0 bg-surface-accent" />{source}</span></p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AgentWindow

const css = `
.ds-agentwin-card { border: var(--ds-border-hairline) solid var(--ds-color-neutral-300); background: var(--ds-color-code); color: var(--ds-color-code-fg); font-family: var(--ds-font-text); }
.ds-agentwin p { margin: 0; }
.ds-agentwin-note { display: flex; align-items: center; gap: var(--ds-space-sm); color: var(--ds-color-code-muted); font-size: var(--ds-text-ui); line-height: var(--ds-text-meta-leading); }
.ds-agentwin-chip { display: inline-flex; align-items: center; gap: var(--ds-space-sm); padding: 1px 6px; background: var(--ds-color-neutral-200); font-size: var(--ds-text-meta); line-height: 18px; vertical-align: 1px; white-space: nowrap; }
.ds-agentwin-shimmer { background: linear-gradient(90deg, var(--ds-color-neutral-500) 30%, var(--ds-color-off-white) 50%, var(--ds-color-neutral-500) 70%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; opacity: 0; }
.ds-agentwin-swap { opacity: 1; }
.ds-agentwin[data-play] .ds-agentwin-card { animation: ds-agentwin-card var(--ds-duration-viz-card) var(--ds-easing-out) 80ms both; }
.ds-agentwin[data-play] .ds-agentwin-in { animation: ds-agentwin-in var(--ds-duration-viz-in) var(--ds-easing-out) both; animation-delay: calc(var(--d) * 1ms); }
.ds-agentwin[data-play] .ds-agentwin-shimmer { opacity: 1; animation: ds-agentwin-shimmer var(--ds-duration-viz-shimmer) linear infinite, ds-agentwin-out var(--ds-duration-enter) ease both; animation-delay: 0ms, calc(var(--d) * 1ms); }
.ds-agentwin[data-play] .ds-agentwin-swap { animation: ds-agentwin-in var(--ds-duration-entrance) var(--ds-easing-out) both; animation-delay: calc(var(--d) * 1ms + 120ms); }
@keyframes ds-agentwin-card { from { opacity: 0; transform: translateY(16px) scale(0.985); } }
@keyframes ds-agentwin-in { from { opacity: 0; transform: translateY(8px); } }
@keyframes ds-agentwin-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes ds-agentwin-shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
@media (prefers-reduced-motion: reduce) {
  .ds-agentwin[data-play] :is(.ds-agentwin-card, .ds-agentwin-in, .ds-agentwin-swap) { animation: none; }
  .ds-agentwin[data-play] .ds-agentwin-shimmer { opacity: 0; animation: none; }
}
`
