'use client'
import { useEffect, useId, useState, type DragEvent, type FormEvent } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { Tabs } from '@/react/components/ui/Tabs'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// Write first documents from the console: upload files or paste text (the console's AddDocuments.vue). A text file is
// one document (its id from its name); a PDF, Word document, PowerPoint deck or Excel workbook becomes one document
// whose hits cite their page, slide or sheet. It checks the namespace's name and the files' types, then calls
// `onUpload` or `onPaste`; the app writes them and passes back `writing`, then `notice` or `error`. `onConnect` is the
// way to an app.
export interface PastedDocument { id: string, text: string }

export interface AddDocumentsProps {
  writing?: boolean
  notice?: string
  error?: string
  namespace?: string
  defaultNamespace?: string
  onNamespaceChange?: (namespace: string) => void
  onUpload?: (namespace: string, files: File[]) => void
  onPaste?: (namespace: string, doc: PastedDocument) => void
  onConnect?: () => void
  onBrowse?: (namespace: string) => void
  className?: string
}

const NAMESPACE = /^[a-z0-9][a-z0-9_-]{0,63}$/
const TEXT = /\.(txt|md|markdown|mdx|csv|tsv|json|jsonl|ndjson|html?|xml|ya?ml|log|rst|tex)$/i
const FILE = /\.(pdf|xlsx|docx|docm|dotx|pptx|pptm|potx|ppsx)$/i
const ACCEPT = '.txt,.md,.markdown,.mdx,.csv,.tsv,.json,.jsonl,.ndjson,.html,.htm,.xml,.yaml,.yml,.log,.rst,.tex,text/*,.pdf,application/pdf,.xlsx,.docx,.docm,.dotx,.pptx,.pptm,.potx,.ppsx'

// An API document id: a letter or digit first, then A-Z a-z 0-9 . _ : - (240 at most, room for a "-N").
function docId(name: string) {
  return name.replace(/[^A-Za-z0-9._:-]+/g, '-').replace(/^[^A-Za-z0-9]+/, '').replace(/-+$/, '').slice(0, 240) || 'document'
}

export function AddDocuments({ writing, notice = '', error = '', namespace: given, defaultNamespace = 'uploads', onNamespaceChange, onUpload, onPaste, onConnect, onBrowse, className }: AddDocumentsProps) {
  const [namespace, setNamespace] = useControllable(given, defaultNamespace, onNamespaceChange)
  const [mode, setMode] = useState<'upload' | 'paste'>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [pasteId, setPasteId] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [rejected, setRejected] = useState('')
  const ids = useId()
  const valid = NAMESPACE.test(namespace)
  const shownError = rejected || error

  function choose(picked: File[]) {
    const bad = picked.filter(f => !FILE.test(f.name) && !TEXT.test(f.name) && !f.type.startsWith('text/'))
    setFiles(picked.filter(f => !bad.includes(f)))
    setRejected(bad.length ? `${bad.map(f => f.name).join(', ')}: not a file this can read. Upload text (.txt, .md, .csv, .json, .html), PDF, Word (.docx), PowerPoint (.pptx) or Excel (.xlsx).` : '')
  }
  const [dragging, setDragging] = useState(false)
  function drop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    choose(Array.from(event.dataTransfer?.files ?? []))
  }
  function upload(event: FormEvent) {
    event.preventDefault()
    if (files.length && valid) onUpload?.(namespace, files)
  }
  function paste(event: FormEvent) {
    event.preventDefault()
    if (!pasteText.trim() || !valid) return
    const id = docId(pasteId.trim() || `note-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`)
    onPaste?.(namespace, { id, text: pasteText })
  }
  // Written: the form clears for the next ones.
  useEffect(() => {
    if (!notice) return
    setFiles([])
    setPasteText('')
    setPasteId('')
  }, [notice])

  return (
    <div data-ds="add-documents" className={cn('flex flex-col gap-3 text-ui', className)}>
      <style href="ds-add-documents" precedence="ds">{css}</style>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={mode} onValueChange={setMode} options={[{ value: 'upload', label: 'Upload files' }, { value: 'paste', label: 'Paste text' }]} label="how to add documents" />
        <span className="type-meta text-fg-muted">or <button type="button" className="ds-adddocs-link" onClick={() => onConnect?.()}>connect an app</button></span>
      </div>

      <div className="max-w-xs">
        <Field label="Namespace" error={valid ? undefined : 'Use a-z, 0-9, _ and -, up to 64 characters.'}>
          {({ id, hintId }) => <Input id={id} value={namespace} onChange={e => setNamespace(e.target.value)} className="font-code" aria-describedby={hintId} invalid={!valid} required autoComplete="off" />}
        </Field>
      </div>

      {mode === 'upload'
        ? (
            <form className="flex flex-col gap-3" onSubmit={upload}>
              <label className="ds-adddocs-drop" data-drag={dragging || undefined} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={drop}>
                <span className="font-medium">{files.length ? `${files.length} ${files.length === 1 ? 'file' : 'files'} selected` : 'Choose or drop files'}</span>
                <span className="text-fg-muted">{files.length ? files.map(f => f.name).join(', ') : '.txt, .md, .csv, .json, .html, .pdf, .docx, .pptx, .xlsx. Each file is one document.'}</span>
                <input type="file" multiple className="sr-only" aria-label="choose files" accept={ACCEPT} onChange={e => choose(Array.from(e.target.files ?? []))} />
              </label>
              <div><Button type="submit" disabled={writing || !files.length || !valid}>{writing ? 'Writing' : 'Add documents'}</Button></div>
            </form>
          )
        : (
            <form className="flex flex-col gap-3" onSubmit={paste}>
              <div className="max-w-md">
                <Field label="Id (optional)">
                  {({ id }) => <Input id={id} value={pasteId} onChange={e => setPasteId(e.target.value)} className="font-code" placeholder="refund-policy" maxLength={240} autoComplete="off" />}
                </Field>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${ids}-text`} className="type-meta text-fg-soft">Text</label>
                <textarea id={`${ids}-text`} value={pasteText} onChange={e => setPasteText(e.target.value)} className="ds-adddocs-text" rows={6} placeholder="Refunds are available for 30 days after purchase." required />
              </div>
              <div><Button type="submit" disabled={writing || !pasteText.trim() || !valid}>{writing ? 'Writing' : 'Add document'}</Button></div>
            </form>
          )}

      {notice && <p role="status">{notice} <button type="button" className="ds-adddocs-link" onClick={() => onBrowse?.(namespace)}>Browse</button></p>}
      {shownError && <p className="bg-surface-danger px-3 py-2 text-fg" role="alert">{shownError}</p>}
    </div>
  )
}

export default AddDocuments

const css = `
.ds-adddocs-drop { display: flex; flex-direction: column; align-items: center; gap: var(--ds-space-xs); padding: 24px 16px; border: var(--ds-border-hairline) dashed var(--ds-color-edge-strong); text-align: center; cursor: pointer; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-adddocs-drop:hover { border-color: var(--ds-color-edge-focus); } }
.ds-adddocs-drop[data-drag] { border-color: var(--ds-color-edge-focus); background: var(--ds-color-surface-subtle); }
.ds-adddocs-drop:has(:focus-visible) { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
.ds-adddocs-text { width: 100%; padding: 6px 10px; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); outline: none; resize: vertical; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-adddocs-text::placeholder { color: var(--ds-color-fg-muted); }
.ds-adddocs-text:focus { border-color: var(--ds-color-edge-focus); }
.ds-adddocs-link { color: var(--ds-color-fg); text-decoration: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 4px; cursor: pointer; transition: text-decoration-color var(--ds-duration-enter) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-adddocs-link:hover { text-decoration-color: var(--ds-color-edge-focus); } }
.ds-adddocs-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
@media (pointer: coarse), (max-width: 767px) { .ds-adddocs-text { font-size: var(--ds-text-input); line-height: var(--ds-text-input-leading); } }
`
