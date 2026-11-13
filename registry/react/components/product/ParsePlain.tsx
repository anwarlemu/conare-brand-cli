'use client'
import { useState, type CSSProperties } from 'react'
import { GripVertical } from 'lucide-react'
import { ParseRead } from '@/react/components/product/ParseRead'
import { ParseSheet } from '@/react/components/product/ParseSheet'
import type { ParseAnswer } from '@/react/hooks/useParse'

// Parse, "Plain or Conare" (parse/Plain.vue): what a plain PDF reader gets beside what Conare read, the same page, one
// red handle between them, so the difference is seen and not claimed: a plain reader runs a table's columns together and
// finds nothing on a scan. The handle is a range input, so arrows move it too; each side keeps reading at any width. On
// a phone the two stack and there is no handle.
export interface ParsePlainProps {
  answer: ParseAnswer
  'data-ds'?: string
}

export function ParsePlain({ answer, 'data-ds': ds = 'parse-plain' }: ParsePlainProps) {
  const [at, setAt] = useState(50)
  return (
    <>
      <style href="ds-parse-plain" precedence="ds">{css}</style>
      <section data-ds={ds} className="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-stretch gap-6 max-lg:grid-cols-1" aria-label="a plain reader and Conare, the same page">
        <div className="m-1.25 self-start border border-edge bg-surface-subtle p-3 outline outline-offset-4 outline-edge">
          <ParseSheet part={answer.part} scan={answer.scan} plays mini />
        </div>
        <div className="ds-parseplain m-1.25" style={{ '--at': `${at}%` } as CSSProperties}>
          <div className="ds-parseplain-layer" data-side="plain">
            <p className="mb-3 type-meta text-fg-muted">A plain PDF reader</p>
            {!answer.plain
              ? <p className="max-w-80 text-fg-soft">No text found. A scan is a picture, so a plain reader has nothing to read.</p>
              : <pre className="m-0 font-code text-meta leading-4.5 break-words whitespace-pre-wrap text-fg-soft">{answer.plain}</pre>}
          </div>
          <div className="ds-parseplain-layer" data-side="conare">
            <p className="mb-3 type-meta text-fg">Conare</p>
            <ParseRead part={answer.part} />
          </div>
          <span className="ds-parseplain-rule" aria-hidden="true"><span><GripVertical size={12} strokeWidth={1.5} /></span></span>
          <input value={at} onChange={e => setAt(Number(e.target.value))} type="range" min="24" max="76" step="1" className="ds-parseplain-range" aria-label="move between a plain reader and Conare" />
        </div>
      </section>
    </>
  )
}

export default ParsePlain

const css = `
.ds-parseplain { position: relative; display: grid; min-height: 560px; grid-template-columns: var(--at) minmax(0, 1fr); overflow: hidden; border: var(--ds-border-hairline) solid var(--ds-color-edge); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; }
.ds-parseplain:has(.ds-parseplain-range:focus-visible) { outline-color: var(--ds-color-edge-accent); }
.ds-parseplain-layer { min-width: 0; overflow: hidden; padding: 16px; background: var(--ds-color-surface); }
.ds-parseplain-layer[data-side="plain"] { background: var(--ds-color-surface-subtle); }
.ds-parseplain-layer .ds-parseread-block { padding: 6px 0; }
.ds-parseplain-rule { position: absolute; top: 0; bottom: 0; left: var(--at); width: 1px; background: var(--ds-color-edge-accent); pointer-events: none; }
.ds-parseplain-rule > span { position: absolute; top: 50%; left: 50%; display: flex; width: 20px; height: 32px; align-items: center; justify-content: center; background: var(--ds-color-home-red-press); color: var(--ds-color-fg-inverse); transform: translate(-50%, -50%); }
.ds-parseplain-range { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; cursor: ew-resize; opacity: 0; touch-action: pan-y; }
@media (max-width: 767px) {
  .ds-parseplain { min-height: 0; grid-template-columns: minmax(0, 1fr); }
  .ds-parseplain-rule, .ds-parseplain-range { display: none; }
  .ds-parseplain-layer[data-side="conare"] { border-top: var(--ds-border-hairline) solid var(--ds-color-edge-accent); }
}
`
