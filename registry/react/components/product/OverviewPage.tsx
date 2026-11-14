'use client'
import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Count } from '@/react/components/ui/Count'
import { Table } from '@/react/components/ui/Table'
import { CellBurst } from '@/react/components/visuals/CellBurst'
import { Grain } from '@/react/components/visuals/Grain'
import { HighlightText } from '@/react/components/visuals/HighlightText'
import { VizWindow } from '@/react/components/visuals/VizWindow'
import { OverviewQueries, type QueryDay } from '@/react/components/product/OverviewQueries'
import type { LineSeries } from '@/react/components/ui/LineChart'

// Overview as it ships (Home.vue, take 7 with lead 5): what a team running Conare checks, with no search box. The line
// under the top bar while setup is unfinished; the greeting and how many documents agents search, with Create API key
// and Read the docs, beside the API key's window on the dark panel, the two in the website's double rule; Queries
// beside Credits; the five largest namespaces. Every value comes in through props; the buttons and rows call their handlers.
// The greeting has the website's letter reveal (highlight-text); the documents count up the first time in a session
// (count); the key window is built on the website's product window (VizWindow) over the grain and a sheet of cells,
// and plays again every 9s while the tab shows (never for reduced motion).
export interface OverviewNamespace { name: string, documents: number, health: 'ready' | 'syncing' | 'error' | 'api', synced?: string, lastUsed?: string }
export interface OverviewSpender { name: string, cost: number, share: number }
export interface OverviewPageProps {
  greeting: string
  documents: number
  setup?: { done: number, total: number }
  queries: { thisMonth: number, p50: number, p95: number, days: QueryDay[], latency: LineSeries[] }
  credits: { left: number, total: number, spenders: OverviewSpender[] }
  namespaces: OverviewNamespace[]
  onFinishSetup?: () => void
  onCreateKey?: () => void
  onReadDocs?: () => void
  onBilling?: () => void
  onViewAll?: () => void
  onOpenNamespace?: (name: string) => void
}

const num = (n: number) => n.toLocaleString('en-US')
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const pct = (p: number) => (p > 0 && p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`)
const MATRIX = Array.from({ length: 9 }, (_, i) => ({ '--k': i + 1 }) as CSSProperties)
const d = (n: number) => ({ '--d': n }) as CSSProperties

export function OverviewPage({ greeting, documents, setup, queries, credits, namespaces, onFinishSetup, onCreateKey, onReadDocs, onBilling, onViewAll, onOpenNamespace }: OverviewPageProps) {
  const share = credits.total ? Math.max(0, Math.min(1, credits.left / credits.total)) : 0
  const top = [...namespaces].sort((a, b) => b.documents - a.documents).slice(0, 5)
  const [keyRun, setKeyRun] = useState(0)
  useEffect(() => {
    const keyLoop = setInterval(() => {
      if (!document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) setKeyRun(r => r + 1)
    }, 9000)
    return () => clearInterval(keyLoop)
  }, [])
  return (
    <>
      <style href="ds-overview-page" precedence="ds">{css}</style>
      <div data-ds="overview-page">
        {setup && setup.done < setup.total && (
          <section className="flex min-h-10 items-center gap-2.5 border-b border-edge bg-surface-subtle py-1.5 pr-3 pl-4 text-meta md:min-h-12" aria-label="what needs doing">
            <span className="size-1.5 shrink-0 bg-edge-accent" aria-hidden="true" />
            <p className="min-w-0 flex-1">{`You haven't finished setting up Conare: ${setup.done} of ${setup.total} steps done.`}</p>
            <PixelButton className="shrink-0" onClick={() => onFinishSetup?.()}>Finish setup <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" /></PixelButton>
          </section>
        )}
        <div className="mx-auto flex w-full max-w-page-wide flex-col gap-6 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20">
          <section className="ds-ovlead" aria-label="your platform">
            <div className="flex min-w-0 flex-col items-start gap-2 bg-surface p-5">
              <HighlightText as="h1" text={greeting} accent="." className="type-heading-2" />
              <p className="max-w-[56ch] text-ui text-fg-muted">Help your agents search through <Count value={documents} once="overview-documents" /> documents.</p>
              <div className="mt-auto flex w-full flex-row items-center gap-2 pt-6">
                <PixelButton onClick={() => onCreateKey?.()}>Create API key</PixelButton>
                <Button onClick={() => onReadDocs?.()}>Read the docs</Button>
              </div>
            </div>
            <div className="relative flex min-h-84 items-center justify-center overflow-hidden bg-code-raised text-ds-neutral-300" aria-hidden="true">
              <Grain />
              <div className="pointer-events-none absolute inset-0 opacity-70"><CellBurst seed={17} /></div>
              <div className="relative flex w-full items-center justify-center px-4 py-6">
                <VizWindow
                  active
                  className="max-w-100"
                  title={(
                    <>
                      <span className="text-ui leading-4">Your code</span>
                      <span className="bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500">API</span>
                    </>
                  )}
                >
                  <div key={keyRun} className="flex flex-col gap-3 px-4 pt-1 pb-4">
                    <p className="ds-viz-in ml-10 bg-ds-neutral-200 px-3 py-2.5 text-ui" style={d(120)}><span className="block type-code-sm text-ds-neutral-500">POST /query</span>How do refunds work?</p>
                    <p className="ds-viz-in flex items-center justify-end gap-1.5 text-meta text-ds-neutral-500" style={d(320)}><span className="text-ds-neutral-600">API key</span> added to headers</p>
                    <div className="ds-viz-in ds-viz-progress" style={d(500)}>
                      <span className="grid size-2.5 shrink-0 place-items-center">
                        <span className="ds-viz-swap-a ds-viz-matrix [grid-area:1/1]" style={d(960)}>{MATRIX.map((m, i) => <i key={i + 1} style={m} />)}</span>
                        <span className="ds-viz-swap-b ds-viz-dot bg-home-red [grid-area:1/1]" style={d(960)} />
                      </span>
                      <span className="grid flex-1">
                        <span className="ds-viz-swap-a [grid-area:1/1]" style={d(960)}>Calling the API</span>
                        <span className="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style={d(960)}>200 OK</span>
                      </span>
                      <span className="ds-viz-swap-b shrink-0 text-ds-neutral-500 tabular-nums" style={d(960)}>62 ms</span>
                    </div>
                    <p className="ds-viz-in text-ui leading-6" style={d(1080)}>Refunds are available for 30 days.</p>
                    <p className="ds-viz-in flex items-center gap-2 text-meta text-ds-neutral-500" style={d(1240)}>Source <span className="ds-viz-chip text-off-white"><span className="ds-viz-dot bg-home-red" />Refunds</span></p>
                  </div>
                </VizWindow>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_288px]">
            <OverviewQueries {...queries} />
            <section className="flex min-w-0 flex-col border border-edge bg-surface" aria-labelledby="credits-title">
              <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-3">
                <h2 id="credits-title" className="type-ui-strong">Credits</h2>
                <a href="#" className="ds-ovlink type-meta text-fg-muted" onClick={(e) => { e.preventDefault(); onBilling?.() }}>Billing</a>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p><span className="text-heading-4 font-medium tabular-nums">{usd(credits.left)}</span> <span className="type-meta text-fg-muted">{`left of ${usd(credits.total)}`}</span></p>
                <div className="h-1 bg-edge" role="meter" aria-valuenow={Math.round(share * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="credits left"><span className="block h-full bg-surface-inverse" style={{ width: `${share * 100}%` }} /></div>
                <ul className="mt-auto divide-y divide-edge">
                  {credits.spenders.map(s => (
                    <li key={s.name} className="flex items-center justify-between gap-3 py-2 text-meta">
                      <span className="min-w-0 truncate type-code-sm">{s.name}</span>
                      <span className="flex shrink-0 items-baseline"><span className="w-16 text-right tabular-nums">{usd(s.cost)}</span><span className="w-10 text-right text-fg-muted tabular-nums">{pct(s.share)}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <section className="flex min-w-0 flex-col gap-2" aria-labelledby="data-title">
            <div className="flex items-center justify-between gap-4">
              <h2 id="data-title" className="type-ui-strong">Namespaces</h2>
              <Button variant="ghost" onClick={() => onViewAll?.()}>View all <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" /></Button>
            </div>
            <Table framed label="namespaces">
              <thead><tr><th>Name</th><th className="hidden md:table-cell">Health</th><th>Documents</th><th className="hidden md:table-cell">Last used</th><th className="w-8"><span className="sr-only">Open</span></th></tr></thead>
              <tbody>
                {top.map(ns => (
                  <tr key={ns.name} className="is-link" onClick={() => onOpenNamespace?.(ns.name)}>
                    <td className="whitespace-nowrap"><button type="button" className="type-code-sm text-left" onClick={(e) => { e.stopPropagation(); onOpenNamespace?.(ns.name) }}>{ns.name}</button></td>
                    <td className="hidden whitespace-nowrap md:table-cell">
                      {ns.health === 'error'
                        ? <span className="inline-flex items-center gap-1.5 bg-status-failed px-1.5 text-meta leading-5 text-status-failed-fg"><span className="size-1 bg-edge-accent" />needs attention</span>
                        : ns.health === 'syncing'
                          ? <span className="inline-flex items-center gap-1.5 bg-status-working px-1.5 text-meta leading-5 text-status-working-fg"><DotMatrix tone="inverse" />syncing</span>
                          : ns.health === 'ready'
                            ? <span className="text-fg-muted">{`Synced ${ns.synced}`}</span>
                            : <span className="text-fg-muted">By API</span>}
                    </td>
                    <td className="tabular-nums">{num(ns.documents)}</td>
                    <td className={ns.lastUsed ? 'hidden whitespace-nowrap md:table-cell' : 'hidden whitespace-nowrap md:table-cell text-fg-muted'}>{ns.lastUsed ?? 'never'}</td>
                    <td className="text-right"><ChevronDown size={12} strokeWidth={1.5} className="inline text-fg-muted" aria-hidden="true" /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </section>
        </div>
      </div>
    </>
  )
}

export default OverviewPage

const css = `
/* The lead in the website's double rule: a hairline, a second 4px outside it. */
/* ds-override: 5px holds the outer rule (4px offset plus its 1px) inside the page, as platform.css does. */
.ds-ovlead { display: grid; margin: 5px; border: var(--ds-border-hairline) solid var(--ds-color-edge); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; }
@media (min-width: 900px) { .ds-ovlead { grid-template-columns: 312px minmax(0, 1fr); } }
@media (min-width: 1180px) { .ds-ovlead { grid-template-columns: 360px minmax(0, 1fr); } }
.ds-ovlink { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-ovlink:hover { color: var(--ds-color-fg); } }
@media (max-width: 639px) { .ds-ovlead :is(button, a) { min-height: 40px; } }
`
