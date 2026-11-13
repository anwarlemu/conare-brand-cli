'use client'
import { useSyncExternalStore } from 'react'

/**
 * A document opens by downloading, never in a panel (the console's useDocumentDownload.ts). The browser's own download
 * bar can sit out of sight, so what was pressed says what happened: each document's state (busy, done, failed) is
 * shared, read by DownloadMark and DownloadButton, and clears 1.8s after. The app hands over the bytes: `get` returns
 * a Blob or text (fetch it from your own API); nothing here calls one.
 */
export type DownloadState = 'busy' | 'done' | 'failed'
let states: Record<string, DownloadState> = {}
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
const get = () => states

function mark(id: string, next?: DownloadState) {
  const all = { ...states }
  if (next) all[id] = next
  else delete all[id]
  states = all
  listeners.forEach(l => l())
}

/** Every document's download state, by id. */
export const useDownloadState = () => useSyncExternalStore(subscribe, get, get)

/** download(id, get, name?) saves what `get` returns as `name` (the id, as text, by default). Works outside components too. */
export async function download(id: string, read: () => Promise<Blob | string> | Blob | string, name?: string) {
  if (states[id] === 'busy') return
  mark(id, 'busy')
  try {
    const body = await read()
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

export function useDocumentDownload() {
  return download
}
