import { ref } from 'vue'

/**
 * A document opens by downloading, never in a panel (the console's useDocumentDownload.ts). The browser's own download
 * bar can sit out of sight, so what was pressed says what happened: each document's state (busy, done, failed) is
 * shared, read by DownloadMark and DownloadButton, and clears 1.8s after. The app hands over the bytes: `get` returns
 * a Blob or text (fetch it from your own API); nothing here calls one.
 */
export type DownloadState = 'busy' | 'done' | 'failed'
const states = ref<Record<string, DownloadState>>({})

/** Every document's download state, by id. */
export const useDownloadState = () => states

function mark(id: string, next?: DownloadState) {
  const all = { ...states.value }
  if (next) all[id] = next
  else delete all[id]
  states.value = all
}

/** download(id, get, name?) saves what `get` returns as `name` (the id, as text, by default). */
export function useDocumentDownload() {
  return async function download(id: string, get: () => Promise<Blob | string> | Blob | string, name?: string) {
    if (states.value[id] === 'busy') return
    mark(id, 'busy')
    try {
      const body = await get()
      const blob = typeof body === 'string' ? new Blob([body], { type: 'text/plain' }) : body
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name ?? `${id}.txt`
      a.click()
      URL.revokeObjectURL(url)
      mark(id, 'done')
    }
    catch {
      mark(id, 'failed')
    }
    // ds-latency: the check stays a moment after the download, which has already happened.
    setTimeout(() => mark(id), 1800)
  }
}
