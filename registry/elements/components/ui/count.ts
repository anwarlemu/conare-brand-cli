import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Count.vue as <conare-count>: the one counter: a number that counts to its new value when it changes (700ms, easing
// out), so a syncing source's documents visibly climb between polls. `rolls` also counts up from nothing as it lands,
// as the website's figures do; `once` does that only the first time this key shows in the browser tab's session.
// `format` (a property) reads it as an amount or a share; plain counts get thousands separators. Tabular figures, so
// the width holds. Reduced motion shows the new value at once.
const ROLL_MS = 700
const still = () => !globalThis.matchMedia || globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
const plain = (n: number) => Math.round(n).toLocaleString('en-US')

// True the first time a key is seen in this tab's session; storage blocked keeps the entrance.
function firstTime(key: string) {
	try {
		const name = `ds-seen:${key}`
		if (sessionStorage.getItem(name)) return false
		sessionStorage.setItem(name, '1')
	} catch {
		// storage blocked
	}
	return true
}

/**
 * @summary A number that counts to its new value when it changes.
 */
export class Count extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: { type: Number }, rolls: { type: Boolean }, once: {}, format: { attribute: false }, shown: { state: true } }

	value = 0
	/** Counts up from nothing as it lands. */
	rolls = false
	/** Counts up from nothing only the first time this key shows in the tab's session. */
	once?: string
	/** Formats the number (an amount, a share); plain counts get thousands separators. */
	format?: (n: number) => string
	private shown = 0
	private raf = 0
	private started = false

	private roll(to: number) {
		cancelAnimationFrame(this.raf)
		if (still()) {
			this.shown = to
			return
		}
		const from = this.shown
		const start = performance.now()
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / ROLL_MS)
			this.shown = from + (to - from) * (1 - (1 - t) ** 3)
			if (t < 1) this.raf = requestAnimationFrame(tick)
		}
		this.raf = requestAnimationFrame(tick)
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (!changed.has('value')) return
		// The first value shows as it is (Vue's initial shown); later ones count to it (Vue's watch).
		if (!this.started) this.shown = this.value
		else this.roll(this.value)
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		this.started = true
		if (still() || !(this.rolls || (this.once && firstTime(this.once)))) return
		this.shown = 0
		this.roll(this.value)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		cancelAnimationFrame(this.raf)
	}

	render() {
		return html`<span data-ds="count" class="tabular-nums">${this.format ? this.format(this.shown) : plain(this.shown)}</span>`
	}
}

define('count', Count)
