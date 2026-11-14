'use client'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Minus, Search, X } from 'lucide-react'
import { cn } from '@/react/lib/cn'
import { Button } from '@/react/components/ui/Button'
import { Table } from '@/react/components/ui/Table'
import { DownloadMark } from '@/react/components/product/DownloadMark'
import { Transition } from '@/react/lib/transition'

// Every search, newest first (searches/Log.vue with the Simple detail): the question, the agent, the outcome in
// Performance's words, the time and when, twelve at a time. A row opens in place under itself (180ms both ways on
// the strong ease-out, what's inside fading in and settling 4px), holding what came back: each passage's sentence
// with the part that answers in ink, its document to download, why a search went wrong and what to do about it.
export type SearchOutcome = 'strong' | 'weak' | 'none' | 'failed'
export interface SearchPassage { id: string, namespace: string, text: string, key: string }
export interface SearchRow { id: string, when: string, question: string, agent: string, outcome: SearchOutcome, tookMs: number, passages: SearchPassage[], why?: string, fix?: { action: string } }
export interface SearchesLogProps {
  rows: SearchRow[]
  page?: number
  onDownload?: (passage: SearchPassage) => void
  onFix?: (row: SearchRow) => void
  onSearch?: (question: string) => void
}

const OUTCOME: Record<SearchOutcome, string> = { strong: 'Strong answer', weak: 'Weak match', none: 'Nothing found', failed: 'Failed' }
const took = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`)
const parts = (p: SearchPassage) => {
  const at = p.text.indexOf(p.key)
  return at < 0 ? [p.text, '', ''] : [p.text.slice(0, at), p.key, p.text.slice(at + p.key.length)]
}

export function SearchesLog({ rows, page = 12, onDownload, onFix, onSearch }: SearchesLogProps) {
  const [open, setOpen] = useState('')
  const [shown, setShown] = useState(page)
  // Vue's watch on the rows: a new list closes the open row and shows a page again.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    setOpen('')
    setShown(page)
  }, [rows]) // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (id: string) => setOpen(o => (o === id ? '' : id))
  return (
    <>
      <style href="ds-searches-log" precedence="ds">{css}</style>
      <div data-ds="searches-log" className="overflow-hidden border border-edge bg-surface">
        <Table>
          <thead className="max-sm:sr-only"><tr><th scope="col">Question</th><th scope="col" className="w-40 max-lg:hidden">Agent</th><th scope="col" className="w-44 max-md:hidden">Outcome</th><th scope="col" className="w-20 text-right max-md:hidden">Time</th><th scope="col" className="w-24 text-right max-lg:hidden">When</th><th scope="col" className="w-8"><span className="sr-only">Open</span></th></tr></thead>
          <tbody>
            {rows.slice(0, shown).map(r => (
              <Fragment key={r.id}>
                <tr className="is-link" onClick={() => toggle(r.id)}>
                  <td className="max-w-0 max-sm:w-full">
                    <button type="button" className={cn('block w-full truncate text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus max-sm:whitespace-normal', open === r.id && 'whitespace-normal')} aria-expanded={open === r.id} aria-controls={`search-${r.id}`} onClick={(e) => { e.stopPropagation(); toggle(r.id) }}>{r.question}</button>
                    <span className="block truncate type-meta text-fg-muted lg:hidden">{`${r.agent}, ${r.when}`}</span>
                  </td>
                  <td className="max-w-0 truncate max-lg:hidden">{r.agent}</td>
                  <td className="whitespace-nowrap max-md:hidden">
                    <span className={cn('inline-flex items-center gap-1.5', r.outcome !== 'strong' && 'text-home-red-press')}>
                      {r.outcome === 'strong'
                        ? <Check size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                        : r.outcome === 'weak'
                          ? <Minus size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                          : <X size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />}{OUTCOME[r.outcome]}
                    </span>
                  </td>
                  <td className="text-right tabular-nums max-md:hidden">{took(r.tookMs)}</td>
                  <td className="text-right text-fg-muted max-lg:hidden">{r.when}</td>
                  <td className="text-right"><ChevronDown size={14} strokeWidth={1.5} className="ds-slog-chev inline text-fg-muted" data-open={open === r.id || undefined} aria-hidden="true" /></td>
                </tr>
                <Transition show={open === r.id} name="ds-slog" duration={180}>
                  <tr id={`search-${r.id}`} className="ds-slog-open">
                    <td colSpan={6}>
                      <div className="ds-slog-grow"><div>
                        <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
                          {r.why && <p>{r.why}</p>}
                          {r.passages.length > 0 && (
                            <ul className="flex flex-col gap-2">
                              {r.passages.map(p => (
                                <li key={p.id} className="flex items-center justify-between gap-6 text-fg-soft max-sm:flex-col max-sm:items-start max-sm:gap-0.5">
                                  <p className="min-w-0 flex-1">{parts(p)[0]}<span className="font-medium text-fg">{parts(p)[1]}</span>{parts(p)[2]}</p>
                                  <span className="flex shrink-0 items-center gap-1">
                                    <button type="button" className="ds-slog-doc type-code-sm whitespace-nowrap" aria-label={`download ${p.id}`} onClick={() => onDownload?.(p)}>{p.id}</button>
                                    <DownloadMark id={p.id} onPress={() => onDownload?.(p)} />
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {r.fix && <Button press onClick={() => onFix?.(r)}>{r.fix.action}</Button>}
                            <Button press onClick={() => onSearch?.(r.question)}><Search size={12} strokeWidth={1.5} aria-hidden="true" />Search it</Button>
                          </div>
                        </div>
                      </div></div>
                    </td>
                  </tr>
                </Transition>
              </Fragment>
            ))}
          </tbody>
        </Table>
      </div>
      {shown < rows.length && <button data-ds="searches-log" type="button" className="ds-slog-more self-start" onClick={() => setShown(s => s + page)}>{`Show ${Math.min(page, rows.length - shown)} more`}</button>}
    </>
  )
}

export default SearchesLog

const css = `
.ds-slog-open > td { height: 0 !important; max-width: 0; padding: 0 !important; background: var(--ds-color-surface-subtle); white-space: normal; }
.ds-slog-open p { margin: 0; }
.ds-slog-grow { display: grid; grid-template-rows: 1fr; }
.ds-slog-grow > div { min-width: 0; min-height: 0; }
:is(.ds-slog-enter-from, .ds-slog-leave-to) .ds-slog-grow { grid-template-rows: 0fr; }
:is(.ds-slog-enter-active, .ds-slog-leave-active) .ds-slog-grow { transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
:is(.ds-slog-enter-active, .ds-slog-leave-active) .ds-slog-grow > div { overflow: hidden; }
.ds-slog-enter-active .ds-slog-grow > div { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-slog-leave-active .ds-slog-grow > div { transition: opacity var(--ds-duration-cell) var(--ds-easing-out); }
.ds-slog-enter-from .ds-slog-grow > div { opacity: 0; transform: translateY(-4px); }
.ds-slog-leave-to .ds-slog-grow > div { opacity: 0; }
/* The chevron turns with the row: 180ms opening, 120ms closing, from where it is. */
.ds-slog-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-slog-chev[data-open] { rotate: 180deg; transition-duration: var(--ds-duration-slide), var(--ds-duration-micro); }
@media (hover: hover) and (pointer: fine) { tr.is-link:hover .ds-slog-chev { color: var(--ds-color-fg); } }
.ds-slog-doc { text-decoration: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 3px; transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-slog-doc:hover { text-decoration-color: var(--ds-color-fg); } }
.ds-slog-more { position: relative; margin-left: 4px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-meta-leading); white-space: nowrap; cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-slog-more::after { position: absolute; inset: -12px; content: ""; }
@media (hover: hover) and (pointer: fine) { .ds-slog-more:hover { color: var(--ds-color-fg); } }
.ds-slog-more:focus-visible, .ds-slog-doc:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  :is(.ds-slog-enter-active, .ds-slog-leave-active) :is(.ds-slog-grow, .ds-slog-grow > div), .ds-slog-chev { transition: none; }
}
`
