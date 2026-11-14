'use client'
import { useRef, useState } from 'react'
import { FileUp, X } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { PixelButton } from '@/react/components/ui/PixelButton'

// More questions, opened in place (accuracy/Add.vue), on the paper in a hairline. Three ways in: paste a list (one a
// line), upload a CSV (its first column), or take what agents already ask, which needs no typing and is the truest
// test. Adding runs them, since a question only helps answered: `onAdd` gets the questions, `onClose` the close button.
export interface AccuracyAddProps {
  asked?: string[]
  onAdd?: (questions: string[]) => void
  onClose?: () => void
}

const count = (n: number) => `${n} ${n === 1 ? 'question' : 'questions'}`

export function AccuracyAdd({ asked = [], onAdd, onClose }: AccuracyAddProps) {
  const [text, setText] = useState('')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const input = useRef<HTMLInputElement | null>(null)
  async function file(list: FileList | null) {
    const f = list?.[0]
    if (!f) return
    setText((await f.text()).split('\n').map(l => l.split(',')[0]!.replace(/^"|"$/g, '').trim()).filter(Boolean).join('\n'))
  }
  return (
    <>
      <style href="ds-accuracy-add" precedence="ds">{css}</style>
      <section data-ds="accuracy-add" className="grid grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-6 border border-edge bg-surface-subtle p-4 max-lg:grid-cols-1" aria-label="add questions">
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="eval-more">questions, one a line</label>
          <textarea id="eval-more" value={text} onChange={e => setText(e.target.value)} className="block w-full resize-y border border-edge-strong bg-surface p-3 text-ui outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus max-md:text-input" rows={5} placeholder="One question a line" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PixelButton disabled={!lines.length} onClick={() => onAdd?.(lines)}>{lines.length ? `Add ${count(lines.length)} and run` : 'Add and run'}</PixelButton>
            <Button press onClick={() => input.current?.click()}><FileUp size={12} strokeWidth={1.5} aria-hidden="true" />Upload a CSV</Button>
            <input ref={input} type="file" accept=".csv,.txt" className="sr-only" tabIndex={-1} aria-label="choose a CSV of questions" onChange={e => void file(e.target.files)} />
            <Button variant="ghost" icon press className="ml-auto" aria-label="close" onClick={() => onClose?.()}><X size={14} strokeWidth={1.5} /></Button>
          </div>
        </div>
        {asked.length > 0 && (
          <div>
            <p className="mb-1 type-meta text-fg-muted">What your agents ask most</p>
            {asked.map(q => <button key={q} type="button" className="ds-askedq" onClick={() => setText(text ? text + '\n' + q : q)}>{q}</button>)}
          </div>
        )}
      </section>
    </>
  )
}

export default AccuracyAdd

const css = `
.ds-askedq { display: block; width: 100%; overflow: hidden; padding: 6px 4px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); text-align: left; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-askedq:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-askedq:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
@media (hover: hover) and (pointer: fine) { .ds-askedq:hover { background: color-mix(in srgb, var(--ds-color-fg) 5%, var(--ds-color-surface-subtle)); } }
@media (pointer: coarse), (max-width: 767px) { .ds-askedq { min-height: 40px; } }
`
