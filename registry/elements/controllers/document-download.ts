import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * useDocumentDownload as a store and a Lit controller: a document opens by downloading, never in a panel (the
 * console's useDocumentDownload.ts). The browser's own download bar can sit out of sight, so what was pressed says what
 * happened: each document's state (busy, done, failed) is shared, read by <conare-download-mark> and
 * <conare-download-button> (DownloadStateController), and clears 1.8s after. The app hands over the bytes: `get`
 * returns a Blob or text (fetch it from your own API); nothing here calls one.
 *
 * Each element module bundles its own copy of this file, so the states live on one object per page (a global symbol),
 * and every copy reads and writes the same one.
 */
export type DownloadState = 'busy' | 'done' | 'failed'
type Store = { states: Record<string, DownloadState>, listeners: Set<() => void> }
const KEY = Symbol.for('ds.document-download')
const store: Store = ((globalThis as unknown as Record<symbol, Store>)[KEY] ??= { states: {}, listeners: new Set() })

function mark(id: string, next?: DownloadState) {
	const all = { ...store.states }
	if (next) all[id] = next
	else delete all[id]
	store.states = all
	store.listeners.forEach((l) => l())
}

/** Every document's download state, by id. */
export const downloadStates = () => store.states

/** download(id, get, name?) saves what `get` returns as `name` (the id, as text, by default). */
export async function download(id: string, read: () => Promise<Blob | string> | Blob | string, name?: string) {
	if (store.states[id] === 'busy') return
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
	} catch {
		mark(id, 'failed')
	}
	// ds-latency: the check stays a moment after the download, which has already happened.
	setTimeout(() => mark(id), 1800)
}

/** Re-renders its element when any document's state changes; `state(id)` reads one. */
export class DownloadStateController implements ReactiveController {
	private off?: () => void
	constructor(private host: ReactiveControllerHost) {
		host.addController(this)
	}
	hostConnected() {
		const listener = () => this.host.requestUpdate()
		store.listeners.add(listener)
		this.off = () => store.listeners.delete(listener)
	}
	hostDisconnected() {
		this.off?.()
	}
	state(id: string): DownloadState | undefined {
		return store.states[id]
	}
}
