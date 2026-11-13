'use client'
import { Check, Download, X } from 'lucide-react'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { useDownloadState, type DownloadState } from '@/react/hooks/useDocumentDownload'

// A document's download at the end of its row (the console's namespaces/DownloadMark.vue, .v2-docdl): a 14px mark,
// muted at rest and ink under the pointer, with a 30px target. Pressed, it says what happened: the dot matrix while
// it works (only after 150ms, so a quick file shows no flash of it), then a check, or a red cross if it failed. The
// marks cross-fade and settle from 0.8 scale. `state` overrides the shared state from useDocumentDownload().
export interface DownloadMarkProps {
  id: string
  state?: DownloadState
  onPress?: () => void
}

export function DownloadMark({ id, state, onPress }: DownloadMarkProps) {
  const shared = useDownloadState()
  const now = state ?? shared[id]
  return (
    <>
      <style href="ds-download-mark" precedence="ds">{css}</style>
      <button data-ds="download-mark" type="button" className="ds-docdl" data-state={now} aria-label={`download ${id}`} onClick={(e) => { e.stopPropagation(); onPress?.() }}>
        <Download data-for="idle" size={14} strokeWidth={1.5} />
        <span data-for="busy" className="inline-grid place-items-center"><DotMatrix /></span>
        <Check data-for="done" size={14} strokeWidth={2} />
        <X data-for="failed" size={14} strokeWidth={2} />
      </button>
      <span data-ds="download-mark" className="sr-only" aria-live="polite">{now === 'done' ? `${id} downloaded` : now === 'failed' ? `${id} failed to download` : ''}</span>
    </>
  )
}

export default DownloadMark

const css = `
.ds-docdl { position: relative; display: inline-grid; width: 14px; height: 14px; flex-shrink: 0; place-items: center; vertical-align: middle; color: var(--ds-color-fg-muted); cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard), transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-docdl::after { position: absolute; inset: -8px; content: ""; }
@media (hover: hover) and (pointer: fine) { .ds-docdl:hover { color: var(--ds-color-fg); } }
.ds-docdl:active { transform: scale(0.92); }
.ds-docdl:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 4px; }
.ds-docdl > * { grid-area: 1 / 1; opacity: 0; scale: 0.8; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard), scale var(--ds-duration-glide) var(--ds-easing-out); }
.ds-docdl:not([data-state]) > [data-for="idle"], .ds-docdl[data-state="done"] > [data-for="done"], .ds-docdl[data-state="failed"] > [data-for="failed"] { opacity: 1; scale: 1; }
.ds-docdl[data-state="busy"] > [data-for="busy"] { opacity: 1; scale: 1; transition-delay: 150ms; }
.ds-docdl[data-state="done"] { color: var(--ds-color-fg); }
.ds-docdl[data-state="failed"] { color: var(--ds-color-fg-danger); }
@media (prefers-reduced-motion: reduce) { .ds-docdl, .ds-docdl > * { scale: 1; transform: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); } }
`
