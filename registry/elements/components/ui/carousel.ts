import { html, LitElement, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { ChevronLeft, ChevronRight } from 'lucide'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// Carousel.vue as <conare-carousel>: slides in a row, one or more in view (new in Conare's style): square, a hairline
// round the track, the arrows as ghost icon buttons with the place in tabular figures between them. Native scroll snap,
// so a swipe or a trackpad moves it as the arrows do; arrow keys work on the focused track. Never plays on its own.
// Each child element is a slide (Vue's `count` and `#slide` scoped slot): the element puts each in its own slide box.
// `per-view` sets how many show at 768px and up (one on phones).

/**
 * @summary Slides in a row with arrows and the place between them.
 * @slot - The slides: each child element is one.
 */
export class Carousel extends DsElement {
	static styles = [DsElement.styles, styles]
	// Each child goes into its own slide's slot, assigned by the element.
	static shadowRootOptions = { ...LitElement.shadowRootOptions, slotAssignment: 'manual' as const }
	static properties = { label: {}, perView: { type: Number, attribute: 'per-view' }, current: { state: true }, visible: { state: true }, slides: { state: true } }

	/** What it holds, for assistive tech ("ways to add data"). */
	label = ''
	/** How many show at 768px and up. */
	perView: 1 | 2 | 3 = 1
	private current = 0
	private visible = 1
	private slides: Element[] = []
	private ro?: ResizeObserver
	private mo?: MutationObserver

	private get count() {
		return this.slides.length
	}
	private get last() {
		return Math.max(0, this.count - this.visible)
	}
	private get track() {
		return this.renderRoot.querySelector<HTMLElement>('.ds-carousel')
	}

	private measure = () => {
		const el = this.track
		const first = el?.firstElementChild as HTMLElement | null
		if (!el || !first) return
		this.visible = Math.max(1, Math.round(el.clientWidth / first.offsetWidth))
		this.current = Math.min(this.last, Math.round(el.scrollLeft / first.offsetWidth))
	}
	private go(i: number) {
		const el = this.track
		const first = el?.firstElementChild as HTMLElement | null
		if (!el || !first) return
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		el.scrollTo({ left: Math.max(0, Math.min(this.last, i)) * first.offsetWidth, behavior: reduce ? 'auto' : 'smooth' })
	}
	private onKey = (e: KeyboardEvent) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault()
			this.go(this.current + 1)
		}
		if (e.key === 'ArrowLeft') {
			e.preventDefault()
			this.go(this.current - 1)
		}
	}

	connectedCallback() {
		super.connectedCallback()
		this.slides = [...this.children]
		this.mo = new MutationObserver(() => { this.slides = [...this.children] })
		this.mo.observe(this, { childList: true })
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.mo?.disconnect()
		this.ro?.disconnect()
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		this.measure()
		this.ro = new ResizeObserver(this.measure)
		if (this.track) this.ro.observe(this.track)
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const slots = this.renderRoot.querySelectorAll<HTMLSlotElement>('slot')
		this.slides.forEach((s, k) => slots[k]?.assign(s))
	}

	render() {
		const count = this.count
		const last = this.last
		const button = tag('button')
		return html`<section data-ds="carousel" class="flex flex-col gap-2" role="region" aria-roledescription="carousel" aria-label=${this.label}><div class="ds-carousel fade-x flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain border border-edge" data-per-view=${this.perView} tabindex="0" aria-label=${`${this.label}, use the arrow keys to move`} @scroll=${this.measure} @keydown=${this.onKey}>${this.slides.map((_, k) => html`<div class="ds-carousel-slide shrink-0 snap-start border-e border-edge last:border-e-0" role="group" aria-roledescription="slide" aria-label=${`${k + 1} of ${count}`}><slot></slot></div>`)}</div><div class="flex items-center justify-end gap-1">${staticHtml`<${button} variant="ghost" icon ?disabled=${this.current <= 0} aria-label=${`previous ${this.label}`} @click=${() => this.go(this.current - 1)}>${icon(ChevronLeft, 'chevron-left', { size: 14, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>`}<span class="min-w-12 text-center type-meta text-fg-muted tabular-nums" aria-live="polite">${`${this.current + 1} / ${last + 1}`}</span>${staticHtml`<${button} variant="ghost" icon ?disabled=${this.current >= last} aria-label=${`next ${this.label}`} @click=${() => this.go(this.current + 1)}>${icon(ChevronRight, 'chevron-right', { size: 14, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>`}</div></section>`
	}
}

define('carousel', Carousel)
