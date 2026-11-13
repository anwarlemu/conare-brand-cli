import { html, nothing, type PropertyValues } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// SplitBar.vue as <conare-split-bar>: a whole in parts, as Billing's prices draw it (the chart's Split example): one
// bar, the parts in the order given (largest first), the picked part in ink with a red mark gliding over it; under it
// the parts as rows in a card, one paper block gliding to the row under the pointer or focus, and a red square on the
// picked row. Pointing at a row picks it (v-model is `value` with `input` and `change`). `detail` is a quiet middle
// column, hidden on phones; `display` is the value as written.
export type SplitPart = { name: string, value: number, display?: string, detail?: string }

/**
 * @summary A whole in parts: one bar over a card of rows, the picked part marked.
 * @fires input - The picked part changed (read `value`, its index).
 * @fires change - The picked part changed.
 */
export class SplitBar extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { parts: { type: Array }, label: {}, value: { type: Number }, mark: { state: true }, instant: { state: true } }

	/** [{ name, value, display?, detail? }], largest first. */
	parts: SplitPart[] = []
	/** The rows' name. */
	label?: string
	/** The picked part's index. */
	value = 0
	private mark: { y: number, h: number } | null = null
	private instant = true

	// The gliding block: placed at once the first time, then it glides on transform.
	private place(i: number) {
		const row = this.renderRoot.querySelectorAll<HTMLElement>('[data-glide-row]')[i]
		if (!row) return
		this.instant = !this.mark
		this.mark = { y: row.offsetTop, h: row.offsetHeight }
	}
	private pick(i: number) {
		if (this.value !== i) this.commit(i)
		this.place(i)
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value') || changed.has('parts')) this.place(this.value)
	}

	render() {
		const parts = this.parts ?? []
		const total = parts.reduce((a, p) => a + p.value, 0) || 1
		// The parts share what the bar's 2px gaps leave, so those come out of the percent.
		const n = parts.length
		const i = Math.min(this.value, n - 1)
		const middle = (parts.slice(0, i).reduce((a, p) => a + p.value, 0) + (parts[i]?.value ?? 0) / 2) / total
		const center = `calc(${middle * 100}% + ${i * 2 - middle * 2 * (n - 1)}px)`
		const on = (k: number) => ifDefined(this.value === k ? 'true' : undefined)
		return html`<div data-ds="split-bar" class="flex flex-col gap-4">
			<div class="ds-segmark-track" aria-hidden="true"><span class="ds-segmark" style=${`transform: translateX(${center})`}><i></i></span></div>
			<div class="ds-splitbar" aria-hidden="true">${repeat(parts, (p) => p.name, (p, k) => html`<span data-on=${on(k)} style=${`flex-grow: ${p.value / total}`}></span>`)}</div>
			<ul class="relative border border-edge bg-surface" aria-label=${ifDefined(this.label)}>
				${this.mark ? html`<span class="ds-rowmark" data-instant=${ifDefined(this.instant ? 'true' : undefined)} style=${`transform: translateY(${this.mark.y}px); height: ${this.mark.h}px`} aria-hidden="true"></span>` : nothing}
				${repeat(parts, (p) => p.name, (p, k) => html`<li data-glide-row class="border-edge [&+&]:border-t"><button type="button" class="ds-priced" data-on=${on(k)} aria-pressed=${String(this.value === k)} @pointerenter=${() => this.pick(k)} @focus=${() => this.pick(k)} @click=${() => this.pick(k)}><span class="min-w-0 flex-1 truncate text-left">${p.name}</span>${p.detail ? html`<span class="hidden text-fg-muted tabular-nums sm:inline">${p.detail}</span>` : nothing}<span class="w-24 text-right tabular-nums">${p.display ?? p.value.toLocaleString('en-US')}</span></button></li>`)}
			</ul>
		</div>`
	}
}

define('split-bar', SplitBar)
