import { html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { Check } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { enter, leave, measure, move } from '@/elements/lib/transition'
import styles from 'virtual:tw'

// Toaster.vue as <conare-toaster>, with useToast: notes at the bottom right, the newest lowest (console2.css
// .v2-toast): black, 12px, a check, the note and its detail in mono, for four seconds, three at most, the same note
// again only restarting its time. One timer runs them all, only while there are any. Their time stops while one is
// pointed at and while the tab is hidden. The newest rises in, the others move up as it lands, and the oldest fades.
// Put one on the page; show a note with `toast(text, detail)` from this module, or the element's toast() method.
export interface Toast { id: number, text: string, detail?: string, left: number }

export const TOAST_MS = 4000
const MOST = 3
const STEP = 100
let toasts: Toast[] = []
let last = 0
const listeners = new Set<() => void>()
const set = (next: Toast[]) => {
	toasts = next
	listeners.forEach((l) => l())
}

/** Shows a note: what just happened, for a moment. */
export function toast(text: string, detail?: string) {
	const same = toasts.find((t) => t.text === text && t.detail === detail)
	if (same) {
		set(toasts.map((t) => (t === same ? { ...t, left: TOAST_MS } : t)))
		return
	}
	last += 1
	set([...toasts.slice(1 - MOST), { id: last, text, detail, left: TOAST_MS }])
}

/**
 * @summary The corner where short notes show.
 */
export class Toaster extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { list: { state: true } }

	/** The notes drawn: the store's, and those still leaving. */
	private list: Array<Toast & { leaving?: boolean }> = []
	private held = false
	private timer?: ReturnType<typeof setInterval>
	private nodes = new Map<number, HTMLElement>()
	private rects = new Map<unknown, DOMRect>()
	private sync = () => {
		const ids = new Set(toasts.map((t) => t.id))
		const leaving = this.list.filter((t) => !ids.has(t.id)).map((t) => ({ ...t, leaving: true }))
		// Leaving notes keep their place; the store's order otherwise.
		const next: typeof this.list = [...toasts]
		for (const t of leaving) next.splice(Math.min(this.list.findIndex((x) => x.id === t.id), next.length), 0, t)
		this.list = next
		this.clock()
	}

	/** Shows a note (the module's toast()). */
	toast(text: string, detail?: string) {
		toast(text, detail)
	}

	private clock() {
		if (toasts.length && !this.timer) {
			// ds-latency: the toasts' own clock, off the input path; nothing waits on it.
			this.timer = setInterval(() => {
				if (this.held || document.hidden) return
				const next = toasts.map((t) => ({ ...t, left: t.left - STEP }))
				set(next.filter((t) => t.left > 0))
			}, STEP)
		}
		if (!toasts.length && this.timer) {
			clearInterval(this.timer)
			this.timer = undefined
			this.held = false
		}
	}

	connectedCallback() {
		super.connectedCallback()
		listeners.add(this.sync)
		this.sync()
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		listeners.delete(this.sync)
		clearInterval(this.timer)
		this.timer = undefined
	}

	protected willUpdate() {
		this.rects = measure(this.nodes)
	}
	protected updated() {
		this.nodes.clear()
		for (const node of this.renderRoot.querySelectorAll<HTMLElement>('.ds-toast')) this.nodes.set(Number(node.dataset.id), node)
		for (const t of this.list) {
			const node = this.nodes.get(t.id)
			if (!node || node.dataset.phase === (t.leaving ? 'leave' : 'shown')) continue
			if (t.leaving) {
				node.dataset.phase = 'leave'
				void leave(node, 'ds-toast').then(() => {
					this.list = this.list.filter((x) => x.id !== t.id)
				})
			} else {
				node.dataset.phase = 'shown'
				if (this.rects.size || this.hasUpdated) void enter(node, 'ds-toast')
			}
		}
		move(this.nodes, this.rects, 'ds-toast')
	}

	render() {
		return html`<div data-ds="toaster" class="ds-toasts" role="status" aria-live="polite" @pointerenter=${() => { this.held = true }} @pointerleave=${() => { this.held = false }}>${repeat(this.list, (t) => t.id, (t) => html`<p class="ds-toast" data-id=${t.id}>${icon(Check, 'check', { size: 12, strokeWidth: 2, class: 'shrink-0', attrs: { 'aria-hidden': 'true' } })}<span class="shrink-0">${t.text}</span>${t.detail ? html`<span class="min-w-0 truncate type-code-sm">${t.detail}</span>` : nothing}</p>`)}</div>`
	}
}

define('toaster', Toaster)
