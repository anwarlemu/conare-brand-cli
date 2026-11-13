import { html, nothing, type PropertyValues } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// CreditHistory.vue as <conare-credit-history>: every time credits were added, newest first (the console's
// billing/Grants.vue, take 1, show more). A team can add credits for years, so it never opens all at once: the latest
// five, then five more at a time. The list is a rule with a square on it for each grant, the newest red; new lines land
// on the rule one after the other (30ms apart) while the list tweens to its new height in 200ms. Past six lines it
// scrolls inside its window, the edges with more behind them fading, its own slim bar in the margin while it moves, and
// Show more runs it down to the new lines. `time-zone` fixes the dates' zone (rendered on a server, pass the reader's
// or UTC so both renders agree).
export interface Grant { amount: number, reason: string, date: string }

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// A full list runs down to the new lines on its own curve (320ms, a quartic ease-out).
function glide(el: HTMLElement, to: number) {
	if (to <= el.scrollTop) return
	if (reduced()) {
		el.scrollTop = to
		return
	}
	const from = el.scrollTop
	const start = performance.now()
	const step = (now: number) => {
		const t = Math.min(1, (now - start) / 320)
		el.scrollTop = from + (to - from) * (1 - (1 - t) ** 4)
		if (t < 1) requestAnimationFrame(step)
	}
	requestAnimationFrame(step)
}

/** @summary Every time credits were added, newest first: five at a time on a ruled ledger. */
export class CreditHistory extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		grants: { type: Array },
		currency: {},
		step: { type: Number },
		timeZone: { attribute: 'time-zone' },
		shown: { state: true },
		fresh: { state: true },
		bar: { state: true },
		moving: { state: true },
	}

	/** [{ amount, reason, date (ISO) }]. */
	grants: Grant[] = []
	currency = 'USD'
	/** How many lines show at first, and how many more each Show more adds. */
	step = 5
	/** The dates' time zone (UTC, or the reader's). */
	timeZone?: string
	private shown?: number
	private fresh?: number
	private bar = { top: 0, height: 0, above: false, below: false }
	private moving = false
	private resting?: ReturnType<typeof setTimeout>
	// The height before Show more, read again once the new lines are in the page (Vue's nextTick).
	private from: number | null = null

	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.resting)
	}

	private get box() {
		return this.renderRoot.querySelector<HTMLElement>('[data-ds="credit-history"]')
	}
	private get list() {
		return this.renderRoot.querySelector<HTMLElement>('.ds-grants')
	}

	private money(n: number) {
		return n.toLocaleString('en-US', { style: 'currency', currency: this.currency })
	}
	private when(iso: string) {
		const d = new Date(iso)
		return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: this.timeZone })
	}

	private showMore() {
		const shown = this.shown ?? this.step
		this.fresh = shown
		this.from = this.box?.offsetHeight ?? 0
		this.shown = shown + this.step
	}

	// The slim bar: there while the list moves or is pointed at.
	private placeBar() {
		const el = this.list
		if (!el) return
		const { scrollTop, scrollHeight, clientHeight } = el
		const room = scrollHeight - clientHeight
		this.bar = { top: (scrollTop / scrollHeight) * clientHeight, height: room > 0 ? (clientHeight / scrollHeight) * clientHeight : 0, above: scrollTop > 1, below: scrollTop < room - 1 }
	}
	private onScroll() {
		this.placeBar()
		this.moving = true
		clearTimeout(this.resting)
		// ds-latency: the bar fades a moment after the list stops; nothing waits on it.
		this.resting = setTimeout(() => { this.moving = false }, 700)
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const start = this.from
		if (start === null || !changed.has('shown')) return
		this.from = null
		const el = this.box
		const to = el?.offsetHeight ?? start
		if (el && to !== start && !reduced()) {
			const easing = getComputedStyle(el).getPropertyValue('--ds-easing-out').trim() || 'ease-out'
			el.animate([{ height: `${start}px`, overflow: 'hidden' }, { height: `${to}px`, overflow: 'hidden' }], { duration: 200, easing })
		}
		this.placeBar()
		const list = this.list
		if (list) glide(list, list.scrollHeight - list.clientHeight)
	}

	render() {
		const sorted = [...(this.grants ?? [])].sort((a, b) => b.date.localeCompare(a.date))
		const shown = this.shown ?? this.step
		const more = Math.min(this.step, sorted.length - shown)
		const fresh = this.fresh
		const b = this.bar
		return html`<div data-ds="credit-history" class="flex min-w-0 flex-col gap-4">
			<div class="ds-grants-view relative">
				<div class="ds-grants" data-above=${ifDefined(b.above ? 'true' : undefined)} data-below=${ifDefined(b.below ? 'true' : undefined)} tabindex="0" role="region" aria-label="credits added" @scroll=${() => this.onScroll()}>
					<ol class="ds-ledger">${repeat(sorted.slice(0, shown), (g) => g.date + g.reason, (g, i) => {
						const isNew = fresh != null && i >= fresh
						return html`<li data-new=${ifDefined(isNew ? 'true' : undefined)} style=${ifDefined(isNew ? `--i: ${i - fresh!}` : undefined)}>
							<span class="min-w-0">
								<span class="block">${g.reason}</span>
								<span class="block type-meta text-fg-muted">${this.when(g.date)}</span>
							</span>
							<span class="shrink-0 font-medium tabular-nums">+${this.money(g.amount)}</span>
						</li>`
					})}</ol>
				</div>
				${b.height ? html`<span class="ds-grants-bar" data-on=${ifDefined(this.moving ? 'true' : undefined)} style=${`height: ${b.height}px; transform: translateY(${b.top}px)`} aria-hidden="true"></span>` : nothing}
			</div>
			${more > 0 ? html`<button type="button" class="ds-more self-start" @click=${() => this.showMore()}>Show ${more} more</button>` : nothing}
		</div>`
	}
}

define('credit-history', CreditHistory)
