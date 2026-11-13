'use client'
import { Check } from 'lucide-react'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { useDownloadState } from '@/react/hooks/useDocumentDownload'

// The dark button for a document, under an opened document or a result (the console's DownloadButton.vue): red
// pixels come in on hover, and it says Downloaded once it has, since the browser's own bar can sit out of sight. The
// words cross in one cell (.v2-swap): Download leaves up, Downloaded comes up with its check drawing, so the width
// holds. Its state is the document's in useDocumentDownload(), unless `done` says.
export interface DownloadButtonProps {
  id: string
  label?: string
  done?: boolean
  onPress?: () => void
}

// Vue casts a boolean prop left out to false, not undefined, so DownloadButton.vue's `done ?? shared` never reads the
// shared state; `done` defaults to false here too, so the flavors agree (see the port report: the fix is Vue's).
export function DownloadButton({ id, label, done = false, onPress }: DownloadButtonProps) {
  const shared = useDownloadState()
  const isDone = done ?? shared[id] === 'done'
  return (
    <>
      <style href="ds-download-button" precedence="ds">{css}</style>
      <PixelButton data-ds="download-button" done={isDone} onClick={() => onPress?.()}>
        <span className="ds-dlswap" data-on={isDone || undefined}>
          <span className="ds-dlswap-a">{label ?? 'Download'}</span>
          <span className="ds-dlswap-b" aria-hidden="true"><Check size={12} strokeWidth={2} />Downloaded</span>
        </span>
        <span className="sr-only" aria-live="polite">{isDone ? 'downloaded' : ''}</span>
      </PixelButton>
    </>
  )
}

export default DownloadButton

const css = `
.ds-dlswap { display: grid; }
.ds-dlswap > span { display: inline-flex; grid-area: 1 / 1; align-items: center; justify-content: center; gap: var(--ds-space-sm); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-dlswap-b { opacity: 0; filter: blur(2px); transform: translateY(5px) scale(0.96); }
.ds-dlswap[data-on] .ds-dlswap-a { opacity: 0; filter: blur(2px); transform: translateY(-5px) scale(0.96); }
.ds-dlswap[data-on] .ds-dlswap-b { opacity: 1; filter: none; transform: none; }
.ds-dlswap-b svg path { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset var(--ds-duration-micro) ease; }
.ds-dlswap[data-on] .ds-dlswap-b svg path { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-enter) var(--ds-easing-out) 40ms; }
@media (prefers-reduced-motion: reduce) {
  .ds-dlswap > span { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
  .ds-dlswap-b svg path { stroke-dashoffset: 0; transition: none; }
}
`
