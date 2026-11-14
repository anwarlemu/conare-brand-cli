'use client'
import { useEffect, useState, type CSSProperties } from 'react'
import { CodePop } from '@/react/components/ui/CodePop'
import type { SearchResult } from '@/react/hooks/useSearchResults'
import { cn } from '@/react/lib/cn'

// A search on the request's clock (SearchRun.vue), the website's demo window in the console's light colours:
// "Searching" shimmers over the namespaces it reads while cells of the index flicker. When the answer is in, "Found in"
// takes its place, the namespaces that held a result keep a red square and the rest step back, each document found
// lights as a red square on the index, and the count reads "4 of 2,749,690 documents", with when it finished and the
// API's time. Each square names its document when pointed at or focused, and a press calls `onReveal` with its key (for
// SearchResults to show it). `nsHref` makes each namespace a link once the answer is in; `code` (the request as the
// app would send it) puts Show code (code-pop) at the end of the footer, opening under it. It follows the request:
// never fake a delay.
export interface SearchRunProps {
  searching: boolean
  answer: { results: SearchResult[], took_ms: number } | null
  namespaces: Array<{ name: string, documents: number }>
  ns?: string
  logoOf?: (namespace: string) => string | null | undefined
  nsHref?: (namespace: string) => string
  code?: string
  onReveal?: (key: string) => void
}

const fmt = (n: number) => n.toLocaleString('en-US')
// Where a cell lights: a small hash, so a document keeps its place.
function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967296
}
const cell = (x: number, y: number) => ({ left: `round(down, ${(x * 100).toFixed(2)}%, 5px)`, top: `${Math.floor(y * 3) * 5}px` })
const sparks = Array.from({ length: 36 }, (_, k) => ({ id: k, style: { ...cell(hash('s' + k + 'x'), hash('s' + k + 'y')), '--s': Math.floor(hash('s' + k + 't') * 900) } as CSSProperties }))

export function SearchRun({ searching, answer, namespaces, ns, logoOf, nsHref, code, onReveal }: SearchRunProps) {
  const logo = (name: string) => logoOf?.(name) ?? null
  const all = namespaces.filter(n => n.documents > 0).sort((a, b) => b.documents - a.documents)
  const read = ns ? all.filter(n => n.name === ns) : all
  const shown = read.slice(0, 4)
  const more = read.length - shown.length
  const total = read.reduce((a, n) => a + n.documents, 0)
  const hitNs = new Set((answer?.results ?? []).map(r => r.namespace))
  const found = !searching && !!answer
  // Each found document takes a slot of its own across the field, at a height its id picks, so their 24px targets
  // never overlap.
  const results = answer?.results ?? []
  const n = Math.max(1, results.length)
  const hits = results.map((r, k) => ({ r, k })).sort((a, b) => hash(a.r.id) - hash(b.r.id)).map(({ r, k }, slot) => {
    const x = 0.04 + ((slot + 0.25 + hash(`${r.id}x`) * 0.5) / n) * 0.9
    return { key: `${r.namespace}/${r.id}`, id: r.id, ns: r.namespace ?? ns, x, style: { ...cell(x, hash(`${r.id}y`) * 0.8), '--s': 80 + k * 70 } as CSSProperties }
  })
  const [tip, setTip] = useState<(typeof hits)[number] | null>(null)
  const [doneAt, setDoneAt] = useState('')
  useEffect(() => {
    if (found) setDoneAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
  }, [found])

  return (
    <section data-ds="search-run" className="ds-run flex flex-col gap-2" data-found={found || undefined} aria-label="search progress">
      <style href="ds-search-run" precedence="ds">{css}</style>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid type-meta" role="status">
          {!found ? <span className="ds-run-shimmer [grid-area:1/1]">Searching</span> : <span className="ds-run-in text-fg-muted [grid-area:1/1]">Found in</span>}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {shown.map((s) => {
            const link = found && nsHref
            const Tag = link ? 'a' : 'span'
            return (
              <Tag key={s.name} href={link ? nsHref(s.name) : undefined} className={cn('ds-runchip', link && 'ds-runchip-link')} data-hit={found && hitNs.has(s.name) ? 'true' : found ? 'false' : undefined}>
                {logo(s.name) && <img src={logo(s.name)!} alt="" width="12" height="12" className="size-2.5 shrink-0 object-contain" />}
                <span className="type-code-sm">{s.name}</span>
                {found && hitNs.has(s.name) && <><span className="ds-runchip-mark" aria-hidden="true" /><span className="sr-only">, has results</span></>}
              </Tag>
            )
          })}
          {more > 0 && <span className="ds-runchip" data-hit={found ? 'false' : undefined}>{`+${more} more`}</span>}
        </span>
      </div>
      <div className="relative mt-1">
        <div className="ds-index">
          {!found
            ? sparks.map(s => <i key={s.id} className="ds-flick" style={s.style} aria-hidden="true" />)
            : hits.map(h => (
                <button
                  key={h.key}
                  type="button"
                  className="ds-hitbtn"
                  style={h.style}
                  aria-label={`${h.id} in ${h.ns}, show it`}
                  onPointerEnter={() => setTip(h)}
                  onPointerLeave={() => setTip(null)}
                  onFocus={() => setTip(h)}
                  onBlur={() => setTip(null)}
                  onClick={() => onReveal?.(h.key)}
                ><i className="ds-hit" aria-hidden="true" /></button>
              ))}
        </div>
        {tip && <p className="ds-hit-tip" style={{ left: `clamp(0px, calc(${(tip.x * 100).toFixed(2)}% - 12px), calc(100% - 220px))` }} aria-hidden="true"><span className="type-code-sm truncate">{tip.id}</span><span className="text-ds-neutral-500">{tip.ns}</span></p>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 type-meta text-fg-muted tabular-nums">
        {!found
          ? <>Searching{total ? ` ${fmt(total)}` : null} documents</>
          : (
              <>
                <span className="ds-run-in"><span className="text-home-red-press">{answer!.results.length}</span>{total ? ` of ${fmt(total)}` : null} documents</span>
                <span className="ds-run-in">{`Done ${doneAt}`}</span>
                <span className="ds-run-in">{`${answer!.took_ms} ms`}</span>
                {code && answer!.results.length > 0 && <CodePop code={code} />}
              </>
            )}
      </div>
    </section>
  )
}

export default SearchRun

const css = `
/* The namespaces read, as quiet words: those that held a result keep a red square, the rest step back. */
.ds-runchip { display: inline-flex; align-items: center; gap: var(--ds-space-xs); color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); white-space: nowrap; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-runchip img { transition: opacity var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-runchip[data-hit="false"] { color: var(--ds-color-fg-muted); }
.ds-runchip[data-hit="false"] img { opacity: 0.5; }
.ds-runchip-mark { width: 4px; height: 4px; flex-shrink: 0; background: var(--ds-color-edge-accent); }
/* Small to the eye, 24px to the pointer. */
.ds-runchip-link { margin-block: -4px; padding-block: 4px; }
@media (hover: hover) and (pointer: fine) { .ds-runchip-link:hover { color: var(--ds-color-fg); } }
.ds-runchip-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 1px; }
/* Searching: light running across the word (.v2-shimmer). */
.ds-run-shimmer { background: linear-gradient(90deg, var(--ds-color-neutral-400) 30%, var(--ds-color-neutral-700) 50%, var(--ds-color-neutral-400) 70%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: ds-run-shimmer 1400ms linear infinite; }
@keyframes ds-run-shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
/* The index: a field of 3px cells on a 5px pitch drawn by a mask over one fill. Cells flicker while it searches;
   each document found is a 2 by 2 block of them, in red, so it sits on the field's grid. */
.ds-index { position: relative; height: 19px; overflow: hidden; }
.ds-run[data-found] .ds-index { overflow: visible; }
.ds-index::before, .ds-hit {
  -webkit-mask-image: linear-gradient(90deg, var(--ds-color-off-black) 3px, transparent 3px), linear-gradient(var(--ds-color-off-black) 3px, transparent 3px);
  mask-image: linear-gradient(90deg, var(--ds-color-off-black) 3px, transparent 3px), linear-gradient(var(--ds-color-off-black) 3px, transparent 3px);
  -webkit-mask-size: 5px 5px;
  mask-size: 5px 5px;
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
.ds-index::before { position: absolute; inset: 0; background: var(--ds-color-neutral-700); content: ""; opacity: 0.6; }
.ds-flick { position: absolute; z-index: 1; width: 3px; height: 3px; background: var(--ds-color-neutral-400); opacity: 0; animation: ds-flick 900ms var(--ds-easing-standard) infinite; animation-delay: calc(var(--s) * 1ms); }
@keyframes ds-flick { 0%, 18%, 100% { opacity: 0; } 6% { opacity: 1; } }
.ds-hitbtn { position: absolute; z-index: 2; display: grid; width: 24px; height: 24px; margin: -8px 0 0 -8px; padding: 0; place-items: center; cursor: pointer; }
.ds-hit { position: static; display: block; width: 8px; height: 8px; background: var(--ds-color-edge-accent); animation: ds-hit-in var(--ds-duration-glide) steps(1, end) calc(var(--s) * 1ms) both; transition: transform var(--ds-duration-micro) var(--ds-easing-standard); }
@keyframes ds-hit-in { from { opacity: 0; } }
@media (hover: hover) and (pointer: fine) { .ds-hitbtn:hover .ds-hit { transform: scale(1.25); } }
.ds-hitbtn:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-off-black); outline-offset: 2px; }
.ds-hit-tip { position: absolute; top: calc(100% + 6px); z-index: 5; display: flex; max-width: 240px; flex-direction: column; gap: var(--ds-space-2xs); padding: var(--ds-space-sm) var(--ds-space-md); background: var(--ds-color-surface-inverse); color: var(--ds-color-off-white); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); pointer-events: none; }
/* What the answer brings in. */
.ds-run-in { animation: ds-run-in var(--ds-duration-enter) var(--ds-easing-out) both; }
@keyframes ds-run-in { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) {
  .ds-flick, .ds-hit, .ds-run-in, .ds-run-shimmer { animation: none; }
  .ds-run-shimmer { color: var(--ds-color-fg-muted); }
  .ds-flick { opacity: 0.6; }
  .ds-hit { transition: none; }
}
`
