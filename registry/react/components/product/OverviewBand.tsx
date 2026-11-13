'use client'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Count } from '@/react/components/ui/Count'
import { TransitionGroup } from '@/react/lib/transition'

// What Conare is doing for a team, in one band above the numbers (overview/Band.vue), three answers to "is it
// working?". `pipeline`: the website's four steps (connect, sync, retrieve, deliver) with the team's numbers in a
// double rule, a broken step red where it broke; a step's number counts up the first time it shows in a session (count),
// with its `unit` after it. `questions`: what a buyer asks, each answered in a sentence. `live`:
// the website's dark panel, the last searches landing one at a time, once, and holding (hidden tabs wait; reduced
// motion shows them all). Each step, question and the live link goes where it points (`href`).
export type OverviewStep = { name: string, value: number | string, unit?: string, line: string, href?: string, red?: boolean }
export type OverviewQuestion = { question: string, answer: string, href?: string, red?: boolean }
export type OverviewSearch = { id: string, question: string, agent: string, took_ms: number, outcome: 'strong' | 'weak' | 'none' | (string & {}) }

export interface OverviewBandProps {
  view?: 'pipeline' | 'questions' | 'live'
  steps?: OverviewStep[]
  questions?: OverviewQuestion[]
  /** The live panel: the big number, its sentence, the link under it and the searches, oldest first. */
  live?: { value: string, line: string, link: string, href?: string, searches: OverviewSearch[] }
}

const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${n} ms`)

export function OverviewBand({ view = 'pipeline', steps = [], questions = [], live }: OverviewBandProps) {
  const rows = (live?.searches ?? []).slice(-6)
  const [shown, setShown] = useState(0)
  const rowsKey = rows.map(r => r.id).join(' ')
  useEffect(() => {
    if (view !== 'live' || !rows.length) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let n = still ? rows.length : 1
    setShown(n)
    if (still) return
    const timer = setInterval(() => {
      if (document.hidden) return
      if (n >= rows.length) return clearInterval(timer)
      n += 1
      setShown(n)
    }, 900)
    return () => clearInterval(timer)
  }, [view, rowsKey]) // eslint-disable-line react-hooks/exhaustive-deps
  // Newest on top.
  const landed = rows.slice(0, shown).reverse()

  return (
    <>
      <style href="ds-overview-band" precedence="ds">{css}</style>
      {view === 'pipeline'
        ? (
            <section data-ds="overview-band" className="ds-pipeline" aria-label="what Conare is doing">
              {steps.map((s) => {
                const Tag = s.href ? 'a' : 'div'
                return (
                  <Tag key={s.name} href={s.href} className="ds-pipeline-step" data-red={s.red || undefined}>
                    <span className="type-meta text-fg-muted">{s.name}</span>
                    <span className="ds-pipeline-num">{typeof s.value === 'number' ? <Count value={s.value} once={`pipeline-${s.name}`} /> : s.value}{s.unit}</span>
                    <span className="ds-pipeline-line type-meta text-fg-muted">{s.line}</span>
                  </Tag>
                )
              })}
            </section>
          )
        : view === 'questions'
          ? (
              <section data-ds="overview-band" className="ds-questions border border-edge bg-surface" aria-label="three questions">
                {questions.map((q) => {
                  const Tag = q.href ? 'a' : 'div'
                  return (
                    <Tag key={q.question} href={q.href} className="ds-questionrow" data-red={q.red || undefined}>
                      <span className="ds-questionrow-q type-meta text-fg-muted">{q.question}</span>
                      <span className="ds-questionrow-a min-w-0 flex-1">{q.answer}</span>
                      {q.href && <ArrowRight size={12} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />}
                    </Tag>
                  )
                })}
              </section>
            )
          : live
            ? (
                <section data-ds="overview-band" className="ds-liveband" aria-label="searches as they land">
                  <div className="ds-liveband-side">
                    <p className="ds-liveband-num">{live.value}</p>
                    <p className="ds-liveband-say">{live.line}</p>
                    {live.href
                      ? <a href={live.href} className="ds-liveband-link">{`${live.link} `}<ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" /></a>
                      : <span className="ds-liveband-link">{`${live.link} `}<ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" /></span>}
                  </div>
                  <ol className="ds-livelog" aria-live="off">
                    <TransitionGroup name="ds-livelog">
                      {landed.map(r => (
                        <li key={r.id}>
                          <span className="min-w-0 flex-1 truncate">{r.question}</span>
                          <span className="ds-livelog-agent">{r.agent}</span>
                          <span className="ds-livelog-ms">{ms(r.took_ms)}</span>
                          <span className="ds-livelog-dot" data-outcome={r.outcome} aria-hidden="true" /><span className="sr-only">{r.outcome}</span>
                        </li>
                      ))}
                    </TransitionGroup>
                  </ol>
                </section>
              )
            : null}
    </>
  )
}

export default OverviewBand

const css = `
/* Pipeline: four steps in the website's double rule, a small chevron of hairlines between them. */
.ds-pipeline { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: calc(var(--ds-space-xs) + var(--ds-border-hairline)); border: var(--ds-border-hairline) solid var(--ds-color-edge); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; }
.ds-pipeline-step { position: relative; display: flex; min-width: 0; flex-direction: column; gap: var(--ds-space-2xs); padding: var(--ds-space-xl); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-pipeline-step + .ds-pipeline-step { border-left: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-pipeline-step + .ds-pipeline-step::before { position: absolute; top: 50%; left: -4px; width: 7px; height: 7px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge-strong); border-right: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); content: ""; transform: translateY(-50%) rotate(45deg); }
.ds-pipeline-line { text-wrap: balance; }
.ds-pipeline-num { overflow: hidden; font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading); font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }
.ds-pipeline-step[data-red]::after { position: absolute; inset: 0 0 auto; height: 2px; background: var(--ds-color-surface-accent); content: ""; }
.ds-pipeline-step[data-red] .ds-pipeline-line { color: var(--ds-color-fg-accent); }
/* Questions: one row each, the question 192px wide in muted meta, the answer in ink. */
.ds-questions > * + * { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-questionrow { display: flex; align-items: center; gap: var(--ds-space-xl); padding: var(--ds-space-lg) var(--ds-space-xl); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-questionrow > span { text-wrap: pretty; }
.ds-questionrow-q { width: 192px; flex-shrink: 0; }
.ds-questionrow[data-red] .ds-questionrow-a { color: var(--ds-color-fg-accent); }
@media (hover: hover) and (pointer: fine) { a:is(.ds-pipeline-step, .ds-questionrow):hover { background: var(--ds-color-surface-subtle); } }
a:is(.ds-pipeline-step, .ds-questionrow):active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
a:is(.ds-pipeline-step, .ds-questionrow):focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
/* Live: the website's dark panel in the double rule. */
.ds-liveband { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--ds-space-2xl); margin: calc(var(--ds-space-xs) + var(--ds-border-hairline)); padding: var(--ds-space-2xl); border: var(--ds-border-hairline) solid var(--ds-color-fg); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; background: var(--ds-color-code); color: var(--ds-color-code-fg); }
.ds-liveband-side { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; gap: var(--ds-space-xs); }
.ds-liveband-num { margin: 0; font-family: var(--ds-font-heading); font-size: var(--ds-text-hero); line-height: var(--ds-text-hero-leading); letter-spacing: var(--ds-tracking-display); font-variant-numeric: tabular-nums; }
.ds-liveband-say { max-width: 280px; margin: 0; color: var(--ds-color-code-muted); font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); }
.ds-liveband-link { display: inline-flex; align-items: center; gap: var(--ds-space-sm); margin-top: auto; padding-top: var(--ds-space-lg); color: var(--ds-color-code-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { a.ds-liveband-link:hover { color: var(--ds-color-code-fg); } }
.ds-livelog { display: flex; min-width: 0; min-height: 184px; flex-direction: column; margin: 0; padding: 0; list-style: none; }
.ds-livelog > li { display: flex; align-items: center; gap: var(--ds-space-lg); padding: var(--ds-space-sm) 0; border-bottom: var(--ds-border-hairline) solid var(--ds-color-neutral-300); font-size: var(--ds-text-meta); line-height: 18px; }
.ds-livelog-agent, .ds-livelog-ms { flex-shrink: 0; color: var(--ds-color-code-muted); font-variant-numeric: tabular-nums; }
.ds-livelog-dot { width: 6px; height: 6px; flex-shrink: 0; background: var(--ds-color-code-fg); }
.ds-livelog-dot:not([data-outcome="strong"]) { background: var(--ds-color-surface-accent); }
.ds-livelog-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-standard), transform var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-livelog-enter-from { opacity: 0; transform: translateY(-6px); }
.ds-livelog-move { transition: transform var(--ds-duration-enter) var(--ds-easing-standard); }
@media (prefers-reduced-motion: reduce) { .ds-livelog-enter-active, .ds-livelog-move { transition: none; } }
@media (max-width: 1023px) {
  .ds-pipeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ds-pipeline-step:nth-child(3) { border-left: 0; }
  .ds-pipeline-step:nth-child(n + 3) { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
  .ds-pipeline-step + .ds-pipeline-step::before { display: none; }
  .ds-liveband { grid-template-columns: minmax(0, 1fr); padding: var(--ds-space-xl); }
}
@media (max-width: 767px) {
  .ds-questionrow { flex-wrap: wrap; gap: 2px 12px; }
  .ds-questionrow-q { width: 100%; }
  .ds-livelog-agent { display: none; }
  .ds-liveband-link { min-height: 40px; }
}
`
