import { html, nothing } from 'lit'
import { Check, Trash2 } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// HoldButton.vue as <conare-hold-button>: a destructive action (revoke a key, disconnect a source) confirmed in the
// button itself, never in a dialog (console2.css .v2-hold, version 1). Pressing and holding fills the button with the
// website's red 6px squares from the left over `ms`; each column carries a white copy of the label, so it turns as the
// squares land; the bin's lid lifts while held; letting go rewinds right to left in under 200ms; at the end the check
// draws and holds a beat before `confirm` fires. The label rolls up to "Hold" under the pointer. Space or Enter hold it
// from the keyboard. Replace the element to set it back if what it confirmed failed.
const PX = 6
interface Grid { cols: number, w: number, h: number, cells: Array<{ d: number, o: number }> }

/**
 * @summary A destructive action confirmed by holding it.
 * @fires confirm - Once the hold completes and the check has drawn.
 */
export class HoldButton extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		label: {},
		ms: { type: Number },
		holding: { state: true },
		done: { state: true },
		grid: { state: true },
	}

	/** The action, as the button says it (Revoke). */
	label = ''
	/** How long the hold takes, in ms. */
	ms = 1000
	private holding = false
	private done = false
	private grid: Grid | null = null
	private timer?: ReturnType<typeof setTimeout>
	private landing?: ReturnType<typeof setTimeout>
	private pointing = false
	private ro?: ResizeObserver

	private finish() {
		this.done = true
		this.holding = false
		// ds-latency: the check is seen before what it confirms happens; the press itself answered at once.
		this.landing = setTimeout(() => this.emit('confirm'), 320)
	}
	private start() {
		if (this.done || this.holding) return
		this.holding = true
		// ds-latency: the hold is the confirmation; its length is the point.
		this.timer = setTimeout(() => this.finish(), this.ms)
	}
	private cancel() {
		clearTimeout(this.timer)
		this.holding = false
	}
	// Safari takes focus off a button as it is pressed, so losing focus ends a hold only by keyboard.
	private press = () => { this.pointing = true; this.start() }
	private release = () => { this.pointing = false; this.cancel() }
	private onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== ' ' && event.key !== 'Enter') return
		event.preventDefault()
		if (!event.repeat) this.start()
	}
	private onKeyUp = (event: KeyboardEvent) => {
		if (event.key === ' ' || event.key === 'Enter') this.cancel()
	}
	private onBlur = () => { if (!this.pointing) this.cancel() }

	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.timer)
		clearTimeout(this.landing)
		this.ro?.disconnect()
	}

	// 6px cells across the button as measured, each lighting when the hold reaches its column, with a little scatter.
	// --d is the way in; --o the way out, right to left.
	private lay() {
		const el = this.renderRoot.querySelector<HTMLElement>('.ds-hold')
		if (!el) return
		const w = el.offsetWidth
		const h = el.offsetHeight
		if (this.grid?.w === w && this.grid.h === h) return
		const cols = Math.ceil(w / PX)
		const rows = Math.ceil(h / PX)
		this.grid = {
			cols,
			w,
			h,
			cells: Array.from({ length: cols * rows }, (_, k) => {
				const col = k % cols
				const scatter = ((k * 37) % 11) / 11
				const at = (col + scatter) / cols
				return { d: Math.round(at * this.ms * 0.94), o: Math.round((1 - at) * 120) }
			}),
		}
	}
	protected firstUpdated(changed: Map<PropertyKey, unknown>) {
		super.firstUpdated(changed)
		this.lay()
		const el = this.renderRoot.querySelector<HTMLElement>('.ds-hold')
		if (el) {
			this.ro = new ResizeObserver(() => this.lay())
			this.ro.observe(el)
		}
	}

	render() {
		const g = this.grid
		const columns = g ? `grid-template-columns: repeat(${g.cols}, ${PX}px)` : ''
		const cell = (c: { d: number, o: number }) => `--d: ${c.d}; --o: ${c.o}`
		return html`<button data-ds="hold-button"
			type="button"
			class="ds-hold"
			?data-holding=${this.holding}
			?data-done=${this.done}
			aria-label=${`hold to ${this.label.toLowerCase()}`}
			@pointerdown=${this.press}
			@pointerup=${this.release}
			@pointerleave=${this.release}
			@pointercancel=${this.release}
			@keydown=${this.onKeyDown}
			@keyup=${this.onKeyUp}
			@blur=${this.onBlur}
			@contextmenu=${(e: Event) => e.preventDefault()}
		>${g
			? html`<span class="ds-hold-px" aria-hidden="true" style=${columns}>${g.cells.map((c) => html`<i style=${cell(c)}></i>`)}</span><span class="ds-hold-inks" aria-hidden="true" style=${columns}>${Array.from({ length: g.cols }, (_, c) => html`<i style=${cell(g.cells[c]!)}><span class="ds-hold-ink" style=${`width: ${g.w}px; height: ${g.h}px; transform: translateX(${-c * PX}px)`}>${icon(Trash2, 'trash-2', { size: 12, strokeWidth: 1.5 })}<span class="ds-hold-word"><span class="invisible">${this.label}</span><span class="absolute inset-x-0">Hold</span></span></span></i>`)}</span><span class="ds-hold-done" aria-hidden="true">${icon(Check, 'check', { size: 12, strokeWidth: 2 })}Done</span>`
			: nothing}<span class="ds-hold-label">${icon(Trash2, 'trash-2', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}<span class="ds-roll"><span class="ds-roll-a">${this.label}</span><span class="ds-roll-b" aria-hidden="true">Hold</span></span></span></button>`
	}
}

define('hold-button', HoldButton)
