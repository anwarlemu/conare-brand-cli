'use client'
import { PenLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnswerText } from '@/react/components/product/AnswerText'
import { PagePreview } from '@/react/components/product/PagePreview'
import { Button } from '@/react/components/ui/Button'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { resultKey, type SearchResult } from '@/react/hooks/useSearchResults'

// The written answer above the passages (search/Written.vue): on the paper with a red edge, the answer's words at 16px
// citing the results it stands on, [1] and [2] as small ink squares. A written answer takes about 2s more than the
// passages, so they land first and the answer follows. Three ways to show it: `first`, by itself above the passages;
// `request`, one button (it costs a second query), which calls `onWrite`; `beside`, the cited page at reading size next
// to the words, following the citation pointed at. `writing` shows the dot matrix; `error` says what went wrong.
// Citations call `onCite` with the result's key, for the results below to show it.
export interface WrittenAnswerProps {
  results: SearchResult[]
  text?: string
  writing?: boolean
  error?: string
  mode?: 'first' | 'request' | 'beside'
  onWrite?: () => void
  onCite?: (key: string) => void
}

export function WrittenAnswer({ results, text = '', writing, error, mode = 'first', onWrite, onCite }: WrittenAnswerProps) {
  const [pointed, setPointed] = useState(1)
  useEffect(() => setPointed(1), [results])
  const shown = results[pointed - 1] ?? results[0]
  function cite(n: number) {
    setPointed(n)
    const r = results[n - 1]
    if (r) onCite?.(resultKey(r))
  }
  if (mode === 'request' && !text && !writing && !error) {
    return <Button data-ds="written-answer" press className="self-start" onClick={() => onWrite?.()}><PenLine size={12} strokeWidth={1.5} aria-hidden="true" />Write an answer</Button>
  }
  return (
    <section data-ds="written-answer" className="ds-written" aria-label="written answer" aria-live="polite">
      <style href="ds-written-answer" precedence="ds">{css}</style>
      <div className="min-w-0 flex-1">
        {error
          ? <p className="bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">{error}</p>
          : writing
            ? <p className="inline-flex items-center gap-1.5 type-meta"><DotMatrix />Writing an answer</p>
            : !text
                ? <p className="type-meta text-fg-muted">Nothing here to write an answer from.</p>
                : <AnswerText text={text} pointed={mode === 'beside' ? pointed : undefined} onPoint={setPointed} onCite={cite} />}
      </div>
      {mode === 'beside' && text && shown?.page && (
        <figure className="ds-written-page">
          <PagePreview key={shown.id} page={shown.page} size="mid" />
          <figcaption className="type-meta text-fg-muted"><span className="block truncate type-code-sm">{shown.id}</span>{`Page ${shown.page.number} of ${shown.page.count}`}</figcaption>
        </figure>
      )}
    </section>
  )
}

export default WrittenAnswer

const css = `
.ds-written { display: flex; gap: var(--ds-space-xl); padding: var(--ds-space-lg) var(--ds-space-xl); border-left: var(--ds-border-focus) solid var(--ds-color-edge-accent); background: var(--ds-color-surface-subtle); }
.ds-written .ds-matrix i { background: var(--ds-color-edge-accent); }
.ds-written-page { display: flex; width: 132px; flex-shrink: 0; flex-direction: column; gap: var(--ds-space-sm); margin: 0; }
@media (max-width: 767px) { .ds-written { flex-direction: column; } }
`
