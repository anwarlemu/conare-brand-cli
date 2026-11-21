'use client'
import { useState } from 'react'
import { ParseRead } from '@/react/components/product/ParseRead'
import type { ParseAnswer } from '@/react/hooks/useParse'

// What was read, on the dark window (parse/Output.vue): as text, as Markdown or as the API's JSON, picked by line tabs
// whose red underline draws from the left. The text and the page beside it point at each other.
export interface ParseOutputProps {
  answer: ParseAnswer
  on?: number | null
  plays?: boolean
  onPoint?: (order: number | null) => void
  onPick?: (order: number) => void
}

const TABS = [{ id: 'text', label: 'Text' }, { id: 'markdown', label: 'Markdown' }, { id: 'json', label: 'JSON' }] as const

export function ParseOutput({ answer, on, plays, onPoint, onPick }: ParseOutputProps) {
  const [tab, setTab] = useState<typeof TABS[number]['id']>('text')
  const json = JSON.stringify({ id: answer.id, state: 'done', name: answer.name, pages: answer.pages, parts: [{ page: answer.part.page, ocr: answer.part.ocr, confidence: answer.part.confidence, blocks: answer.part.blocks }] }, null, 2)
  return (
    <>
      <style href="ds-parse-output" precedence="ds">{css}</style>
      <div data-ds="parse-output" className="flex min-h-0 flex-1 flex-col">
        <div className="flex gap-4 border-b border-code-edge px-4" role="tablist" aria-label="what was read">
          {TABS.map(t => <button key={t.id} type="button" role="tab" className="ds-parsetab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        {tab === 'text'
          ? <ParseRead role="tabpanel" className="fade-xy min-h-0 flex-1 overflow-auto p-2" part={answer.part} on={on} plays={plays} onPoint={onPoint} onPick={onPick} />
          : <pre className="fade-xy m-0 min-h-0 flex-1 overflow-auto p-4 font-code text-meta leading-4.5 whitespace-pre" tabIndex={0} role="tabpanel">{tab === 'markdown' ? answer.markdown : json}</pre>}
      </div>
    </>
  )
}

export default ParseOutput

const css = `
.ds-parsetab { position: relative; padding: 10px 0; color: var(--ds-color-code-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); cursor: pointer; touch-action: manipulation; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parsetab::after { position: absolute; inset: auto 0 -1px; height: 1px; background: var(--ds-color-surface-accent); content: ""; transform: scaleX(0); transform-origin: left; transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-parsetab[aria-selected="true"] { color: var(--ds-color-code-fg); }
.ds-parsetab[aria-selected="true"]::after { transform: scaleX(1); }
.ds-parsetab:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
@media (hover: hover) and (pointer: fine) { .ds-parsetab:hover { color: var(--ds-color-code-fg); } }
@media (pointer: coarse), (max-width: 767px) { .ds-parsetab { min-width: 40px; min-height: 40px; } }
@media (prefers-reduced-motion: reduce) { .ds-parsetab::after { transition: none; } }
`
