import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { GlideMarkController } from '@/elements/controllers/glide-mark'
import styles from 'virtual:tw'

// GlideMark.vue as <conare-glide-mark>: the gliding block itself (console2.css .v2-rowmark): the paper behind the row
// the list points at, moving on transform and height in 200ms on the strong ease-out, and placed without a glide the
// first time. Put it first inside the list (which is position: relative) and give the rows a z-index above it.
// Reduced motion places it at once.
//
// Draw it from `mark` and `instant`, as GlideMark.vue is drawn from useGlideMark; or give it `follow` and it runs
// useGlideMark (GlideMarkController) on its own list: the list's [data-glide-row] rows, the block gliding to the row
// under the pointer or focus and resting on row `rest` (none: it hides) when the pointer leaves the list.

/**
 * @summary One block that glides behind the row under the pointer.
 */
export class GlideMark extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { mark: { attribute: false }, instant: { type: Boolean }, follow: { type: Boolean }, rest: { type: Number } }

	/** Where the block is: its top and height in the list, in px. */
	mark: { y: number, h: number } | null = null
	/** Place it without a glide. */
	instant = false
	/** Follow the pointer and focus over its own list's [data-glide-row] rows. */
	follow = false
	/** With `follow`: the row it rests on when the pointer leaves (unset: it hides). */
	rest: number | null = null

	private glide = new GlideMarkController(this, () => (this.follow ? this.parentElement : null), () => (this.rest ?? null))
	private list: HTMLElement | null = null
	private over: Element | null = null

	private rowIndex(target: EventTarget | null) {
		const list = this.list
		if (!list || !(target instanceof Element)) return -1
		const row = target.closest('[data-glide-row]')
		// The control inside the row, as the rows' own pointerenter has it (not the row's hairline).
		if (!row || row === target || !list.contains(row)) return -1
		return [...list.querySelectorAll('[data-glide-row]')].indexOf(row)
	}
	private onOver = (e: Event) => {
		const i = this.rowIndex(e.target)
		const row = i < 0 ? null : this.list!.querySelectorAll('[data-glide-row]')[i]!
		if (row === this.over) return
		this.over = row
		if (i >= 0) this.glide.point(i)
	}
	private onFocus = (e: Event) => {
		const i = this.rowIndex(e.target)
		if (i >= 0) this.glide.point(i)
	}
	private onLeave = () => {
		this.over = null
		this.glide.leave()
	}

	connectedCallback() {
		super.connectedCallback()
		if (!this.follow) return
		this.list = this.parentElement
		this.list?.addEventListener('pointerover', this.onOver)
		this.list?.addEventListener('focusin', this.onFocus)
		this.list?.addEventListener('pointerleave', this.onLeave)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.list?.removeEventListener('pointerover', this.onOver)
		this.list?.removeEventListener('focusin', this.onFocus)
		this.list?.removeEventListener('pointerleave', this.onLeave)
		this.list = null
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (!this.follow) return
		this.mark = this.glide.shown ? this.glide.mark : null
		this.instant = this.glide.instant
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// A new resting row: the block goes there at once (useGlideMark's settle).
		if (this.follow && changed.has('rest') && changed.get('rest') !== undefined) this.glide.settle()
	}

	render() {
		const m = this.mark
		if (!m) return nothing
		return html`<span data-ds="glide-mark" class="ds-rowmark" ?data-instant=${this.instant} style="transform: translateY(${m.y}px); height: ${m.h}px" aria-hidden="true"></span>`
	}
}

define('glide-mark', GlideMark)
