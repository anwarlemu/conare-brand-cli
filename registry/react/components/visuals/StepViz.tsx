import type { CSSProperties } from 'react'
import { VizWindow } from '@/react/components/visuals/VizWindow'

// How it works' window (the website's StepViz.vue): one search shown step by step, as an agent window. The ask in a
// filled bubble, what was added to context, a status that shimmers while it works and then says how it went, the
// outcome as a sentence with the records it touched as inline chips, and a progress row with the dot matrix and a
// ticking timer. Steps: 0 write, 1 sync a source, 2 search (results land where they were found, then glide to the
// reranked order), 3 an agent over MCP. One window for every step: picking one keeps the window and crossfades what is
// in it, every step's body in one grid cell so the window never resizes; `runs` re-keys the picked body, replaying it.
export interface StepVizProps {
  step: number
  runs: number[]
  active: boolean
}

const windows = [
  { name: 'Conare', tag: 'Write', ask: 'Add our refund and shipping policies to docs', context: 'Policies.pdf', working: 'Writing', took: 'Worked for 2s' },
  { name: 'Conare', tag: 'Source', ask: 'Keep HubSpot in sync with CRM', context: 'HubSpot', working: 'Syncing', took: 'Synced 3 records' },
  { name: 'Conare', tag: 'Search', ask: 'How do refunds work?', context: 'Docs', working: 'Searching', took: 'Reranked in 62 ms' },
  { name: 'Your agent', tag: 'MCP', ask: 'How do refunds work?', context: 'Conare', working: 'Thinking', took: 'Worked for 1s' },
]

// Found in one order, shown after the rerank in another: `from` and `to` are each row's place before and after.
const results = [
  { id: 'Refunds', text: 'Refunds are available for 30 days.', score: '0.91', from: 2, to: 0 },
  { id: 'Returns', text: 'Return an item from your orders page.', score: '0.47', from: 0, to: 1 },
  { id: 'Shipping', text: 'Orders ship within two days.', score: '0.12', from: 1, to: 2 },
].map(r => ({ ...r, row: { '--from': r.from, '--to': r.to, '--d': 1200 + r.from * 160 } as CSSProperties, bar: { '--w': r.score, '--d': 2900 + r.to * 120 } as CSSProperties }))

// The loader's nine squares, each blinking a beat after the last.
const MATRIX_STYLES = Array.from({ length: 9 }, (_, i) => ({ '--k': i + 1 }) as CSSProperties)
const s = (v: Record<string, number>) => v as CSSProperties

function Matrix() {
  return <span className="ds-viz-matrix" aria-hidden="true">{MATRIX_STYLES.map((m, i) => <i key={i + 1} style={m} />)}</span>
}

export function StepViz({ step, runs, active }: StepVizProps) {
  return (
    <>
      <style href="ds-step-viz" precedence="ds">{css}</style>
      <VizWindow
        data-ds="step-viz"
        active={active}
        className="max-w-100"
        title={(
          <span className="grid">
            {windows.map((w, i) => (
              <span key={w.tag} className="ds-viz-title flex items-center gap-2 whitespace-nowrap [grid-area:1/1]" data-active={i === step}>
                <span className="text-ui leading-4">{w.name}</span>
                <span className="bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500">{w.tag}</span>
              </span>
            ))}
          </span>
        )}
      >
        <div className="grid grid-cols-[minmax(0,1fr)]">
          {windows.map((w, k) => (
            <div key={w.tag} className="ds-viz-body [grid-area:1/1]" data-active={k === step} inert={k !== step}>
              <div key={`${k}-${runs[k] ?? 0}`} className="ds-viz flex flex-col gap-3 px-4 pt-1 pb-4" data-active={active}>
                {/* The ask, and what came with it. */}
                <p className="ds-viz-in ml-10 bg-ds-neutral-200 px-3 py-2.5 text-ui" style={s({ '--d': 200 })}>{w.ask}</p>
                <p className="ds-viz-in flex items-center justify-end gap-1.5 text-meta text-ds-neutral-500" style={s({ '--d': 600 })}>
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" /><rect x="3" y="3" width="3" height="6" fill="currentColor" /></svg>
                  <span className="text-ds-neutral-600">{w.context}</span> added to context
                </p>

                {/* Status: shimmers while it works, then says how it went. */}
                <p className="ds-viz-in grid text-meta" style={s({ '--d': 900 })}>
                  <span className="ds-viz-swap-a ds-viz-shimmer [grid-area:1/1]" style={s({ '--d': 2400 })}>{`${w.working}…`}</span>
                  <span className="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style={s({ '--d': 2400 })}>{`${w.took} `}<span className="ds-step-play">▶</span></span>
                </p>

                {k === 0
                  ? (
                      <>
                        <p className="ds-viz-in text-ui leading-6" style={s({ '--d': 1300 })}>
                          Wrote <span className="ds-viz-chip"><span className="ds-viz-dot bg-home-red" />Refunds</span> and <span className="ds-viz-chip"><span className="ds-viz-dot bg-home-red" />Shipping</span> to the docs namespace, searchable now.
                        </p>
                        <div className="ds-viz-in ds-viz-progress" style={s({ '--d': 1600 })}>
                          <Matrix />
                          <span className="grid flex-1">
                            <span className="ds-viz-swap-a [grid-area:1/1]" style={s({ '--d': 2400 })}>Writing 2 documents…</span>
                            <span className="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style={s({ '--d': 2400 })}>2 documents created</span>
                          </span>
                          <span className="ds-viz-timer" style={s({ '--to': 2, '--d': 1600 })} />
                        </div>
                      </>
                    )
                  : k === 1
                    ? (
                        <>
                          <p className="ds-viz-in text-ui leading-6" style={s({ '--d': 1300 })}>
                            Updated <span className="ds-viz-chip"><span className="ds-viz-dot bg-home-red" />Deal 4821</span>, created <span className="ds-viz-chip"><span className="ds-viz-dot bg-home-red" />Deal 4830</span> and deleted <span className="ds-viz-chip"><span className="ds-viz-dot bg-ds-neutral-500" /><span className="line-through">Contact 913</span></span>.
                          </p>
                          <div className="ds-viz-in ds-viz-progress" style={s({ '--d': 1600 })}>
                            <Matrix />
                            <span className="grid flex-1">
                              <span className="ds-viz-swap-a [grid-area:1/1]" style={s({ '--d': 2400 })}>Syncing HubSpot…</span>
                              <span className="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style={s({ '--d': 2400 })}>Next sync in 15 min</span>
                            </span>
                            <span className="ds-viz-timer" style={s({ '--to': 4, '--d': 1600 })} />
                          </div>
                        </>
                      )
                    : k === 2
                      ? (
                          // Search: results land where they were found, then glide to the reranked order on a 48px track.
                          <div className="relative h-[146px] border border-ds-neutral-300">
                            {results.map(r => (
                              <div key={r.id} className="ds-viz-row absolute inset-x-0 top-0 flex h-12 items-center gap-3 border-b border-ds-neutral-300 bg-ds-neutral-100 px-3" style={r.row}>
                                <span className={r.to === 0 ? 'ds-viz-dot bg-home-red' : 'ds-viz-dot bg-ds-neutral-500'} />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-ui leading-4">{r.id}</span>
                                  <span className="block truncate text-meta text-ds-neutral-500">{r.text}</span>
                                </span>
                                <span className="w-16 shrink-0">
                                  <span className="block text-right text-caption text-ds-neutral-500 tabular-nums">{r.score}</span>
                                  <span className="mt-1 block h-0.5 bg-ds-neutral-300">
                                    <span className="ds-viz-bar block h-full bg-off-white" style={r.bar} />
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )
                      : (
                          // An agent over MCP.
                          <>
                            <p className="ds-viz-in text-ui leading-6" style={s({ '--d': 1300 })}>
                              Called <span className="ds-viz-chip">Search</span> in docs. Refunds are available for 30 days.
                            </p>
                            <p className="ds-viz-in flex items-center gap-2 text-meta text-ds-neutral-500" style={s({ '--d': 2600 })}>
                              Source <span className="ds-viz-chip text-off-white"><span className="ds-viz-dot bg-home-red" />Refunds</span>
                            </p>
                          </>
                        )}
              </div>
            </div>
          ))}
        </div>
      </VizWindow>
    </>
  )
}

export default StepViz

const css = `
/* The finished status's play mark, three quarters of the line's size (9px on 12px). */
.ds-step-play { font-size: 0.75em; }
`
