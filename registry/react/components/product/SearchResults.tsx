'use client'
import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnswerText } from '@/react/components/product/AnswerText'
import { DownloadButton } from '@/react/components/product/DownloadButton'
import { PagePreview } from '@/react/components/product/PagePreview'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { MarkedText } from '@/react/components/ui/MarkedText'
import { resultKey, type ResultPage, type SearchResult } from '@/react/hooks/useSearchResults'
import { cn } from '@/react/lib/cn'

// Search results, "Best match" (search/BestMatch.vue): the top result is the answer most of the time, so it gets the
// card, the full passage at a larger size with the query's words marked, the pages around it (its own outlined in red)
// and its source; the rest follow as one quiet line each, to scan, and a line opens in place to its full passage.
// `answer` puts a written answer in the card instead of the passage, citing results [1], [2]; `writing` holds the
// card's room with the dot matrix while it is written. `reveal` (a result's key and a time) opens that result, brings
// it into view and flashes it once, as the search run's squares do. `logoOf` gives a namespace's app mark. `download`
// puts the document's dark Download button (document-download) under the best match and each opened match, keyed by
// the result's key so it says Downloaded once it has; `actions` (Vue's scoped slot, a function of the result) adds
// other buttons beside it. Results rise in, 60ms apart.
export interface SearchResultsProps {
  results: SearchResult[]
  query: string
  answer?: string
  writing?: boolean
  reveal?: { key: string, at: number } | null
  logoOf?: (namespace: string) => string | null | undefined
  download?: (result: SearchResult) => void
  onCite?: (key: string) => void
  actions?: (result: SearchResult) => ReactNode
}

const pageLine = (p: ResultPage) => `Page ${p.number} of ${p.count}`
// The pages before and after the passage's, unmarked.
const around = (p: ResultPage) => [p.number - 1, p.number, p.number + 1].filter(n => n >= 1 && n <= p.count).map(n => ({ ...p, number: n, here: n === p.number }))

export function SearchResults({ results, query, answer, writing, reveal, logoOf, download, onCite, actions }: SearchResultsProps) {
  const pre = `match-${useId()}`
  const [open, setOpen] = useState('')
  useEffect(() => setOpen(''), [results])
  const logo = (ns: string) => logoOf?.(ns) ?? null
  const answers = writing || answer !== undefined

  // A flash clears, then comes back once the page has drawn without it (Vue's nextTick), so its animation runs again.
  const [flash, setFlash] = useState('')
  const pending = useRef<{ key: string, i: number } | null>(null)
  function bringIn(key: string) {
    const i = results.findIndex(r => resultKey(r) === key)
    if (i < 0) return
    if (i > 0) setOpen(key)
    setFlash('')
    pending.current = { key, i }
  }
  useEffect(() => {
    const p = pending.current
    if (!p || flash) return
    pending.current = null
    setFlash(p.key)
    document.getElementById(p.i === 0 ? `${pre}-top` : `${pre}-row-${p.i - 1}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
  })
  useEffect(() => { if (reveal) bringIn(reveal.key) }, [reveal?.at]) // eslint-disable-line react-hooks/exhaustive-deps
  function cite(n: number) {
    const r = results[n - 1]
    if (!r) return
    onCite?.(resultKey(r))
    bringIn(resultKey(r))
  }
  const ends = (r: SearchResult) => (actions || download) && <span className="flex items-center gap-2">{actions?.(r)}{download && <DownloadButton id={resultKey(r)} onPress={() => download(r)} />}</span>

  const top = results[0]
  return (
    <div data-ds="search-results" className="ds-results flex flex-col gap-6">
      <style href="ds-search-results" precedence="ds">{css}</style>
      {top && (
        <article id={`${pre}-top`} className="ds-rise border border-edge bg-surface" data-flash={flash === resultKey(top) || undefined} style={{ '--i': 0 } as CSSProperties}>
          <div className="flex min-w-0 flex-col gap-9 px-4 pt-4 pb-4.5">
            {answers
              ? (
                  <div className="min-h-12" aria-live="polite">
                    {writing
                      ? <p className="inline-flex items-center gap-1.5 type-meta"><DotMatrix />Writing an answer</p>
                      : answer ? <AnswerText text={answer} onCite={cite} /> : <p className="ds-answer-text"><MarkedText text={top.text} query={query} /></p>}
                  </div>
                )
              : <p className="type-body-lg text-ds-neutral-200"><MarkedText text={top.text} query={query} /></p>}
            {top.page && (
              <div className="flex items-end gap-2">
                {around(top.page).map(p => <PagePreview key={p.number} page={p} size="thumb" marked={p.here} here={p.here} />)}
                <span className="ml-1 type-meta text-fg-muted">{`${pageLine(top.page)} in `}<span className="type-code-sm">{top.page.file}</span></span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge py-2.5 pr-2 pl-4">
            <span className="flex min-w-0 items-center gap-1.5">
              {logo(top.namespace) && <img src={logo(top.namespace)!} alt="" width="14" height="14" className="size-3.5 shrink-0 object-contain" />}
              <span className="truncate type-code-sm">{top.id}</span>
              <span className="shrink-0 type-meta text-fg-muted">in <span className="type-code-sm">{top.namespace}</span>{`, ${top.score.toFixed(2)}`}</span>
            </span>
            {ends(top)}
          </div>
        </article>
      )}

      {results.length > 1 && (
        <section className="ds-others flex flex-col gap-1" aria-labelledby={`${pre}-more`}>
          <h2 id={`${pre}-more`} className="type-meta text-fg-muted">Other matches</h2>
          <ol className="ds-others-rows">
            {results.slice(1).map((r, i) => {
              const key = resultKey(r)
              const on = open === key
              return (
                <li id={`${pre}-row-${i}`} key={key} className="ds-rise" data-flash={flash === key || undefined} style={{ '--i': i + 1 } as CSSProperties}>
                  <button type="button" className="ds-match w-full text-left" aria-expanded={on} aria-controls={`${pre}-${i}`} onClick={() => setOpen(o => (o === key ? '' : key))}>
                    {logo(r.namespace) && <img src={logo(r.namespace)!} alt="" width="12" height="12" className="size-3 shrink-0 object-contain" />}
                    <span className="ds-match-id w-40 shrink-0 truncate max-sm:w-auto max-sm:min-w-0 max-sm:flex-1">{r.id}</span>
                    <span className={cn('hidden min-w-0 flex-1 truncate sm:block', on && 'invisible')}>{r.text}</span>
                    {r.page && <span className="hidden shrink-0 tabular-nums sm:inline">{`p. ${r.page.number}`}</span>}
                    <span className="shrink-0 tabular-nums">{r.score.toFixed(2)}</span>
                    <ChevronDown size={12} strokeWidth={1.5} className="ds-match-chev shrink-0 text-fg-muted" aria-hidden="true" />
                  </button>
                  {/* Opens by its rows' height (0fr to 1fr), so it grows to fit. */}
                  <div id={`${pre}-${i}`} className="ds-expand" data-open={on || undefined} inert={!on}>
                    <div className="min-h-0 overflow-hidden">
                      <div className="flex min-w-0 flex-col gap-3 pt-1 pb-3">
                        <p className="leading-5.5 text-ds-neutral-200"><MarkedText text={r.text} query={query} /></p>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="flex flex-wrap gap-x-4 gap-y-1 type-meta text-fg-muted">
                            <span>in <span className="type-code-sm">{r.namespace}</span></span>
                            {r.page && <span>{pageLine(r.page)}</span>}
                          </span>
                          {ends(r)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}

export default SearchResults

const css = `
/* Results rise in, each 60ms after the last (console2.css .v2-results[data-motion="1"] .v2-rise). */
.ds-results .ds-rise { animation: ds-results-in var(--ds-duration-enter) var(--ds-easing-out) both; animation-delay: calc(var(--i, 0) * 60ms); }
@keyframes ds-results-in { from { opacity: 0; transform: translateY(12px); } }
/* The dot matrix in red while the answer is written (.v2-proc .v2-matrix). */
.ds-results .ds-matrix i { background: var(--ds-color-edge-accent); }
.ds-others-rows > * + * { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
/* Other matches: a quiet list under the answer, every row still opening. */
.ds-match { display: flex; min-height: var(--ds-size-control-md); align-items: center; gap: var(--ds-space-md); padding: 0; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-match-id { color: var(--ds-color-fg-soft); font-family: var(--ds-font-code); font-size: var(--ds-text-meta); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-match:hover { color: var(--ds-color-fg-soft); }
  .ds-match:hover .ds-match-id { color: var(--ds-color-fg); }
}
.ds-match:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-match-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out); }
.ds-match[aria-expanded="true"] .ds-match-chev { rotate: 180deg; transition-duration: var(--ds-duration-slide); }
.ds-expand { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
.ds-expand[data-open] { grid-template-rows: 1fr; }
/* A result shown from its square flashes its red outline once. */
.ds-results [data-flash] { animation: ds-results-flash var(--ds-duration-flash) var(--ds-easing-standard) both; }
@keyframes ds-results-flash { 0%, 40% { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; } 100% { outline: var(--ds-border-focus) solid transparent; outline-offset: -2px; } }
@media (prefers-reduced-motion: reduce) {
  .ds-results .ds-rise, .ds-results [data-flash] { animation: none; }
  .ds-match-chev, .ds-expand { transition: none; }
}
`
