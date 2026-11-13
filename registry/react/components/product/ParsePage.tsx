'use client'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { Check, FileUp } from 'lucide-react'
import { ParseReading } from '@/react/components/product/ParseReading'
import { ScopeMenu, type ScopeOption } from '@/react/components/product/ScopeMenu'
import { Button } from '@/react/components/ui/Button'
import { CodePop } from '@/react/components/ui/CodePop'
import { CopyButton } from '@/react/components/ui/CopyButton'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import type { ParseAnswer } from '@/react/hooks/useParse'
import { useControllable } from '@/react/hooks/useControllable'

// Parse as a page (pages/dashboard/parse.vue): drop any file and see what Conare read, region by region. Nothing is
// stored. A row of files to try and one of your own (a press or a drop; the row takes a red dashed edge while a file is
// dragged over it), the picked one with a 2px red line along its top and the dot matrix while it reads. Then the reading
// (ParseReading, `version` picks the take), and what comes next: into a namespace (scope-menu, one must be chosen),
// the Markdown, or the API call opening in place (code-pop). The app reads the file: it answers `onChosenChange` (Vue's v-model:chosen) and
// `onFile` and passes the `answer`.
export interface ParseSampleFile { id: string, what: string, line: string, pages: number }
export interface ParsePageProps {
  samples: ParseSampleFile[]
  answer: ParseAnswer | null
  reading?: boolean
  version?: 1 | 2 | 3
  namespaces?: ScopeOption[]
  curl?: string
  own?: string
  chosen?: string
  defaultChosen?: string
  onChosenChange?: (id: string) => void
  onFile?: (file: File) => void
  onAdd?: (namespace: string) => void
}

export function ParsePage({ samples, answer, reading, version = 1, namespaces = [], curl = '', own = '', chosen: chosenValue, defaultChosen = '', onChosenChange, onFile, onAdd }: ParsePageProps) {
  const [chosen, setChosen] = useControllable(chosenValue, defaultChosen, onChosenChange)
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement | null>(null)
  function take(files: FileList | null | undefined) {
    const f = files?.[0]
    if (f) onFile?.(f)
  }
  function drop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    take(event.dataTransfer?.files)
  }
  const [into, setInto] = useState(namespaces[0]?.name ?? '')
  const [added, setAdded] = useState(false)
  useEffect(() => setAdded(false), [answer?.id])
  function add() {
    setAdded(true)
    onAdd?.(into)
  }
  return (
    <>
      <style href="ds-parse-page" precedence="ds">{css}</style>
      <div data-ds="parse-page" className="ds-parsefiles grid grid-cols-4 gap-2 max-lg:grid-cols-2" data-drag={dragging || undefined} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={(e) => { e.preventDefault(); setDragging(false) }} onDrop={drop}>
        {samples.map(s => (
          <button key={s.id} type="button" className="ds-parsefile" aria-pressed={chosen === s.id} onClick={() => setChosen(s.id)}>
            <span className="min-w-0">
              <span className="block truncate type-ui-strong">{s.what}</span>
              <span className="block truncate type-meta text-fg-muted">{`${s.line}, ${s.pages} ${s.pages === 1 ? 'page' : 'pages'}`}</span>
            </span>
            {chosen === s.id && reading
              ? <DotMatrix />
              : chosen === s.id && <Check size={14} strokeWidth={1.5} className="shrink-0 max-sm:hidden" aria-hidden="true" />}
          </button>
        ))}
        <button type="button" className="ds-parsefile" onClick={() => input.current?.click()}>
          <span className="min-w-0">
            <span className="block truncate type-ui-strong">Your file</span>
            <span className="block truncate type-meta text-fg-muted">Drop it here</span>
          </span>
          <FileUp size={14} strokeWidth={1.5} className="shrink-0 max-sm:hidden" aria-hidden="true" />
        </button>
        <input ref={input} type="file" className="sr-only" tabIndex={-1} aria-label="choose a file to parse" onChange={e => take(e.target.files)} />
      </div>

      {!answer
        ? <p data-ds="parse-page" className="type-meta text-fg-muted">Reading.</p>
        : (
            <>
              <ParseReading data-ds="parse-page" key={answer.id + answer.name} answer={answer} version={version} />
              <div data-ds="parse-page" className="flex flex-wrap items-center gap-2">
                {added
                  ? <p className="inline-flex items-center gap-1.5 type-meta" role="status"><Check size={12} strokeWidth={2} aria-hidden="true" />Added to <span className="font-code">{into}</span></p>
                  : namespaces.length > 0 && (
                    <>
                      <ScopeMenu value={into} onValueChange={setInto} options={namespaces} single />
                      <Button press disabled={!into} onClick={add}>Add to namespace</Button>
                    </>
                  )}
                <CopyButton text={answer.markdown} label="Copy Markdown" className="ml-auto" />
                {curl && <CodePop code={curl} label="API call" title="Parse this file from your code" />}
              </div>
              {own && answer.name === own && <p data-ds="parse-page" className="type-meta text-fg-muted">This shows a sample reading, not your file.</p>}
            </>
          )}
    </>
  )
}

export default ParsePage

const css = `
.ds-parsefiles { outline: var(--ds-border-hairline) dashed transparent; outline-offset: 4px; transition: outline-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parsefiles[data-drag] { outline-color: var(--ds-color-edge-accent); }
.ds-parsefile { position: relative; display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: var(--ds-space-md); padding: 8px 12px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); text-align: left; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parsefile::before { position: absolute; inset: -1px -1px auto; height: 2px; background: var(--ds-color-surface-accent); content: ""; transform: scaleX(0); transform-origin: left; transition: transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-parsefile[aria-pressed="true"] { background: var(--ds-color-surface-subtle); }
.ds-parsefile[aria-pressed="true"]::before { transform: scaleX(1); }
.ds-parsefile:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
.ds-parsefile:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
@media (hover: hover) and (pointer: fine) { .ds-parsefile:hover { background: var(--ds-color-surface-subtle); } }
@media (prefers-reduced-motion: reduce) { .ds-parsefile::before { transition: none; } }
`
