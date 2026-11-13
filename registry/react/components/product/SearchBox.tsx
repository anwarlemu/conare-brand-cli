'use client'
import { ArrowUp, Check, ClipboardType, CornerDownLeft, FileText, Image, Plug, Plus, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { Menu } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { useControllable } from '@/react/hooks/useControllable'

// The search box as Explorer has it (design-system field/Search, console2.css .v2-searchbox, .v2-attach), and the
// library's input group: a field with controls before and after it. The question in a 14px textarea; the files
// attached, each showing adding, then added (or failed); a bar with the plus for more data (files, photos and scans,
// pasted text, an app), the `scope` node for where it looks, the Enter cue and the red arrow, live once there is a
// question. Enter searches, Shift+Enter breaks the line. Files can be dropped on it. The hairline turns ink while
// anything inside has focus. It calls nothing: it calls `onSubmit`, `onFiles`, `onPaste`, `onConnect` and `onRemove`,
// and the app owns `attached`. The question is `value` / `defaultValue` / `onValueChange` (Vue's v-model).
export interface Attachment { key: string, name: string, state: 'adding' | 'added' | 'failed' }

export interface SearchBoxProps {
  attached?: Attachment[]
  label?: string
  placeholder?: string
  /** Where added data goes, named in the add menu. */
  target?: string
  busy?: boolean
  accept?: string
  addMenu?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (question: string) => void
  onFiles?: (files: File[]) => void
  onPaste?: (text: string) => void
  onConnect?: () => void
  onRemove?: (key: string) => void
  /** Where it looks (Vue's `scope` slot), such as a ScopeMenu. */
  scope?: ReactNode
}

const NONE: Attachment[] = []

export function SearchBox({ attached = NONE, label = 'question', placeholder = 'Ask a question your documents answer', target = 'uploads', busy, accept = '.pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.json,.html', addMenu = true, value, defaultValue = '', onValueChange, onSubmit, onFiles, onPaste, onConnect, onRemove, scope }: SearchBoxProps) {
  const [question, setQuestion] = useControllable(value, defaultValue, onValueChange)
  const id = useId()

  const [dragging, setDragging] = useState(false)
  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    const files = Array.from(event.dataTransfer?.files ?? [])
    if (files.length) onFiles?.(files)
  }
  const fileInput = useRef<HTMLInputElement | null>(null)
  const photoInput = useRef<HTMLInputElement | null>(null)
  function pickFiles(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const files = Array.from(input.files ?? [])
    if (files.length) onFiles?.(files)
    input.value = ''
  }

  const [pasting, setPasting] = useState(false)
  const [pasted, setPasted] = useState('')
  const pasteArea = useRef<HTMLTextAreaElement | null>(null)
  // Paste text opens the box, then focuses it once it is in the page (Vue's nextTick).
  const focusPaste = useRef(false)
  useEffect(() => {
    if (!focusPaste.current || !pasting) return
    focusPaste.current = false
    pasteArea.current?.focus()
  }, [pasting])
  function startPaste() {
    focusPaste.current = true
    setPasting(true)
  }
  function addPasted() {
    onPaste?.(pasted.trim())
    setPasted('')
    setPasting(false)
  }

  function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!question.trim() || busy) return
    onSubmit?.(question.trim())
  }
  function onKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  return (
    <form data-ds="search-box" className="ds-searchbox w-full" role="search" data-drag={dragging || undefined} onSubmit={submit} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={(e) => { if (e.target === e.currentTarget) setDragging(false) }} onDrop={onDrop}>
      <style href="ds-search-box" precedence="ds">{css}</style>
      <label className="sr-only" htmlFor={`${id}-q`}>{label}</label>
      <textarea id={`${id}-q`} value={question} onChange={e => setQuestion(e.target.value)} rows={2} placeholder={dragging ? 'Drop files to add them' : placeholder} onKeyDown={onKey} />
      {pasting && (
        <div className="mx-3 mt-1 flex flex-col gap-2 border border-edge bg-surface-subtle p-2">
          <label className="sr-only" htmlFor={`${id}-paste`}>text to add</label>
          <textarea id={`${id}-paste`} ref={pasteArea} value={pasted} onChange={e => setPasted(e.target.value)} rows={3} className="w-full resize-none bg-transparent type-ui outline-none placeholder:text-fg-muted" placeholder="Paste a note, an email or a policy" onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setPasting(false) } }} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPasting(false)}>Cancel</Button>
            <PixelButton disabled={!pasted.trim()} onClick={addPasted}>Add text</PixelButton>
          </div>
        </div>
      )}
      {attached.length > 0 && (
        <ul className="flex flex-wrap gap-2 px-3 pt-1" aria-label="attached files">
          {attached.map(a => (
            <li key={a.key} className="ds-attach" data-state={a.state}>
              {a.state === 'adding' ? <DotMatrix /> : a.state === 'failed' ? <X size={12} strokeWidth={1.5} aria-hidden="true" /> : <Check size={12} strokeWidth={2} aria-hidden="true" />}
              <span className="max-w-50 truncate">{a.name}</span>
              <span className="sr-only">{a.state}</span>
              <button type="button" className="ds-attach-x" aria-label={`remove ${a.name} from the list`} onClick={() => onRemove?.(a.key)}><X size={12} strokeWidth={1.5} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="ds-searchbox-bar">
        {addMenu && (
          <>
            <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden="true" accept={accept} onChange={pickFiles} />
            <input ref={photoInput} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden="true" accept="image/png,image/jpeg,image/webp,image/tiff" onChange={pickFiles} />
            <Menu label="add data" triggerLabel="add data" width="244px" triggerClass="ds-addbtn" trigger={<Plus size={14} strokeWidth={1.5} aria-hidden="true" />}>
              <MenuLabel><span>Add to <span className="font-code">{target}</span></span></MenuLabel>
              <MenuItem onSelect={() => fileInput.current?.click()}><FileText size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" /><span className="flex-1">Files</span><span className="type-meta text-fg-muted">PDF, Word, slides</span></MenuItem>
              <MenuItem onSelect={() => photoInput.current?.click()}><Image size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" /><span className="flex-1">Photos and scans</span></MenuItem>
              <MenuItem onSelect={startPaste}><ClipboardType size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" /><span className="flex-1">Paste text</span></MenuItem>
              <MenuSeparator />
              <MenuItem onSelect={() => onConnect?.()}><Plug size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" /><span className="flex-1">Connect an app</span></MenuItem>
            </Menu>
          </>
        )}
        {scope}
        <span className="ml-auto hidden items-center gap-1 type-meta text-fg-muted sm:flex"><CornerDownLeft size={12} strokeWidth={1.5} aria-hidden="true" />to search</span>
        <Button type="submit" variant="primary" icon className="ml-auto sm:ml-0" disabled={!question.trim() || busy} aria-label={busy ? 'searching' : 'search'}>
          {busy ? <DotMatrix tone="inverse" /> : <ArrowUp size={14} strokeWidth={1.5} aria-hidden="true" />}
        </Button>
      </div>
    </form>
  )
}

export default SearchBox

const css = `
.ds-searchbox { border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-searchbox:focus-within, .ds-searchbox[data-drag] { border-color: var(--ds-color-edge-focus); }
.ds-searchbox[data-drag] { background: var(--ds-color-surface-subtle); }
.ds-searchbox > textarea { display: block; width: 100%; min-height: 56px; padding: 12px 12px 0; resize: none; background: transparent; color: var(--ds-color-fg); font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); outline: none; }
.ds-searchbox textarea::placeholder { color: var(--ds-color-fg-muted); }
.ds-searchbox-bar { display: flex; align-items: center; gap: var(--ds-space-md); padding: 8px; }
.ds-addbtn { display: inline-flex; width: var(--ds-size-control-sm); height: var(--ds-size-control-sm); align-items: center; justify-content: center; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-addbtn[aria-expanded="true"] { border-color: var(--ds-color-edge-focus); background: var(--ds-color-surface); }
@media (hover: hover) and (pointer: fine) { .ds-addbtn:hover { border-color: var(--ds-color-edge-focus); } }
.ds-addbtn:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 1px; }
.ds-attach { display: inline-flex; height: 26px; align-items: center; gap: var(--ds-space-sm); padding: 0 2px 0 8px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); font-size: var(--ds-text-meta); animation: ds-attach-in var(--ds-duration-enter) var(--ds-easing-out) both; }
.ds-attach[data-state="added"] > svg:first-child { color: var(--ds-color-fg); }
.ds-attach[data-state="failed"] { border-color: var(--ds-color-home-red-press); color: var(--ds-color-fg-danger); }
.ds-attach-x { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; color: var(--ds-color-fg-muted); cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-attach-x:hover { color: var(--ds-color-fg); } }
@keyframes ds-attach-in { from { opacity: 0; transform: translateY(6px); } }
@media (pointer: coarse), (max-width: 767px) {
  .ds-addbtn { width: var(--ds-size-control-touch); height: var(--ds-size-control-touch); }
  .ds-attach-x { position: relative; }
  .ds-attach-x::after { position: absolute; inset: -10px; content: ""; }
}
@media (prefers-reduced-motion: reduce) { .ds-attach { animation-name: ds-attach-fade; } }
@keyframes ds-attach-fade { from { opacity: 0; } }
`
