'use client'
import { Check, Copy, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AppMark } from '@/react/components/product/AppMark'
import { Button } from '@/react/components/ui/Button'
import { CodePop } from '@/react/components/ui/CodePop'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { useCopy } from '@/react/hooks/useCopy'

// The ways data comes in, the fewest clicks first, nothing to name first (the console's namespaces/NewData.vue, take
// 1 with API first, the picks): Send by API leads with one prompt for a coding agent and the request a click away;
// then the likeliest eight apps, each tile's Connect in its corner under the pointer (always there on touch); then one
// quiet line for files, and the whole panel takes a drop. It calls back with what was picked; the app connects,
// uploads and watches for the first write, passing back `connecting`, `uploading`, `waiting` and `landed`.
export interface App { type: string, name: string, logo?: string | null }

export interface AddDataProps {
  apps: App[]
  /** The prompt that sends the documents, and the request it makes. */
  prompt: string
  code: string
  /** Where the first API write lands. */
  namespace: string
  connecting?: string
  uploading?: number
  waiting?: boolean
  landed?: boolean
  error?: string
  /** A close button beside it, where it opens over a page (the namespaces page); Home shows it without. */
  closable?: boolean
  onConnect?: (app: App) => void
  onFiles?: (files: File[]) => void
  onCopied?: () => void
  onOpen?: (namespace: string) => void
  onClose?: () => void
}

export function AddData({ apps, prompt, code, namespace, connecting, uploading, waiting, landed, error, closable, onConnect, onFiles, onCopied, onOpen, onClose }: AddDataProps) {
  const { copied, copy } = useCopy()
  async function copyPrompt() {
    if (await copy(prompt)) onCopied?.()
  }
  const picker = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(0)
  function dropped(event: DragEvent) {
    event.preventDefault()
    setDragging(0)
    const files = Array.from(event.dataTransfer?.files ?? [])
    if (files.length) onFiles?.(files)
  }
  function picked(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const files = Array.from(input.files ?? [])
    if (files.length) onFiles?.(files)
    input.value = ''
  }
  return (
    <div data-ds="add-data" className="flex items-start gap-3">
      <style href="ds-add-data" precedence="ds">{css}</style>
      <section className="ds-newdata min-w-0 flex-1" data-drag={dragging > 0 || undefined} aria-label="add data" onDragEnter={(e) => { e.preventDefault(); setDragging(d => d + 1) }} onDragOver={e => e.preventDefault()} onDragLeave={(e) => { e.preventDefault(); setDragging(d => d - 1) }} onDrop={dropped}>
        <h3 className="type-ui-strong">Send by API</h3>
        <div className="flex flex-wrap items-center gap-2">
          <PixelButton done={copied} onClick={copyPrompt}>
            <span className="ds-newdata-swap" data-on={copied || undefined}>
              <span className="ds-newdata-swap-a"><Copy size={12} strokeWidth={1.5} aria-hidden="true" />Copy prompt for your agent</span>
              <span className="ds-newdata-swap-b" aria-hidden="true"><Check size={12} strokeWidth={2} />Copied</span>
            </span>
          </PixelButton>
          <CodePop code={code} />
        </div>
        {waiting && (
          <p className="flex flex-wrap items-center gap-1.5 type-meta" role="status">
            {landed
              ? <><Check size={12} strokeWidth={2} aria-hidden="true" />1 document landed in <span className="type-code-sm">{namespace}</span></>
              : <><DotMatrix />Waiting for your first document</>}
            {landed && <PixelButton className="ml-auto" onClick={() => onOpen?.(namespace)}>{`Open ${namespace}`}</PixelButton>}
          </p>
        )}

        <h3 className="type-ui-strong">Or connect an app</h3>
        <ul className="ds-apptiles">
          {apps.slice(0, 8).map(a => (
            <li key={a.type} className="ds-apptile" data-busy={connecting === a.type || undefined} onClick={() => onConnect?.(a)}>
              <AppMark name={a.name} logo={a.logo} size={20} />
              <span className="max-w-full truncate">{a.name}</span>
              <PixelButton className="ds-apptile-go" disabled={!!connecting} aria-label={`connect ${a.name}`} onClick={(e) => { e.stopPropagation(); onConnect?.(a) }}>{connecting === a.type ? 'Opening' : 'Connect'}</PixelButton>
            </li>
          ))}
        </ul>

        <p className="type-meta text-fg-muted" aria-live="polite">
          {uploading
            ? <><DotMatrix className="mr-1.5 inline-grid" />{`Uploading ${uploading === 1 ? '1 file' : `${uploading} files`}`}</>
            : <>Or drop files here, or <button type="button" className="ds-newdata-link" onClick={() => picker.current?.click()}>choose files</button>.</>}
        </p>
        {error && <p className="bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">{error}</p>}
        <input ref={picker} type="file" multiple hidden onChange={picked} />
      </section>
      {closable && <Button variant="ghost" icon aria-label="close add data" onClick={() => onClose?.()}><X size={14} strokeWidth={1.5} /></Button>}
    </div>
  )
}

export default AddData

const css = `
.ds-newdata { position: relative; display: flex; flex-direction: column; gap: var(--ds-space-lg); font-size: var(--ds-text-ui); }
.ds-newdata[data-drag]::after { position: absolute; inset: -8px; display: flex; align-items: center; justify-content: center; border: var(--ds-border-hairline) dashed var(--ds-color-edge-focus); background: color-mix(in srgb, var(--ds-color-surface-subtle) 92%, transparent); content: "Drop files to upload"; font-size: var(--ds-text-ui); pointer-events: none; }
.ds-newdata-link { color: inherit; text-decoration: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 3px; cursor: pointer; transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-newdata-link:hover { text-decoration-color: var(--ds-color-fg); } }
.ds-newdata-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
.ds-newdata-swap { display: grid; }
.ds-newdata-swap > span { display: inline-flex; grid-area: 1 / 1; align-items: center; justify-content: center; gap: var(--ds-space-sm); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-newdata-swap-b { opacity: 0; filter: blur(2px); transform: translateY(5px) scale(0.96); }
.ds-newdata-swap[data-on] .ds-newdata-swap-a { opacity: 0; filter: blur(2px); transform: translateY(-5px) scale(0.96); }
.ds-newdata-swap[data-on] .ds-newdata-swap-b { opacity: 1; filter: none; transform: none; }
.ds-apptiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--ds-space-md); margin: 0; padding: 0; list-style: none; }
@media (min-width: 900px) { .ds-apptiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.ds-apptile { position: relative; display: flex; width: 100%; height: 100%; min-height: 104px; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 12px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-apptile .ds-apptile-go { position: absolute; right: 10px; bottom: 10px; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-apptile:hover { border-color: var(--ds-color-edge-focus); } .ds-apptile:hover .ds-apptile-go { opacity: 1; } }
@media (hover: none) { .ds-apptile .ds-apptile-go { position: static; opacity: 1; } }
.ds-apptile:focus-within { border-color: var(--ds-color-edge-focus); }
.ds-apptile:focus-within .ds-apptile-go, .ds-apptile[data-busy] .ds-apptile-go { opacity: 1; }
@media (max-width: 767px) {
  .ds-apptiles { grid-template-columns: minmax(0, 1fr); gap: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge); }
  .ds-apptiles > li + li { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
  .ds-apptile { height: auto; min-height: 56px; flex-direction: row; align-items: center; justify-content: flex-start; gap: var(--ds-space-lg); padding: 8px 12px; border: 0; }
  .ds-apptile > span { min-width: 0; }
  .ds-apptile .ds-apptile-go { position: static; margin-left: auto; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { .ds-newdata-swap > span { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; } }
`
