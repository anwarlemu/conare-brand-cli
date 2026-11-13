import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { SeenController } from '@/elements/controllers/cell-burst'
import '@/elements/components/visuals/grain'
import '@/elements/components/visuals/cell-burst'
import styles from 'virtual:tw'

// BlogCard.vue as <conare-blog-card>: a blog post as a card: in its own ruled box, which takes the paper under the
// pointer, a picture (a grained dark panel and a jumbled sheet of cells) with the category in red at its top right,
// then the title, its line, and at the foot, each in a ruled tag, who it is from and the date. The `window` slot is
// what plays in the picture once the card is on screen (the website puts a benchmark's leaderboard there, a
// <conare-eval-viz>, which is stretched to the box): it is laid out at one size on every card, 520 by 380, and scaled
// as a whole to fit, so every card's window matches and none reflows. The element sets `active` (and `stretch`) on what
// is in the slot once 40% of the picture is on screen (Vue's scoped `active`); it stays hidden, not blank, until then.
const VIZ_W = 520
const VIZ_H = 380

/**
 * @summary A blog post as a card, with its picture of cells.
 * @slot window - A 520 by 380 window that plays once the card is on screen (it gets `active`).
 */
export class BlogCard extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { href: {}, heading: {}, dek: {}, category: {}, author: {}, date: {}, seed: { type: Number }, fit: { state: true } }

	href = ''
	/** The post's title (Vue's `title`). */
	heading = ''
	/** Its line. */
	dek?: string
	category = ''
	author?: string
	date?: string
	/** Which cells the picture lights (by default from the title). */
	seed?: number
	private fit = 0.7
	private seen = new SeenController(this, () => this.renderRoot.querySelector('[data-art]'), 0.4)
	private ro?: ResizeObserver

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		const art = this.renderRoot.querySelector('[data-art]')
		this.ro = new ResizeObserver(([entry]) => {
			const { width, height } = entry!.contentRect
			this.fit = Math.min((width * 0.88) / VIZ_W, (height * 0.88) / VIZ_H)
		})
		if (art) this.ro.observe(art)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.ro?.disconnect()
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// Vue's scoped `active`, and the stretch its classes give the window's root.
		const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="window"]')
		for (const el of slot?.assignedElements() ?? []) {
			el.toggleAttribute('stretch', true)
			el.toggleAttribute('active', this.seen.seen)
		}
	}

	render() {
		const seed = this.seed ?? 71 + this.heading.length * 13
		const win = this.hasSlot('window')
		return html`<a data-ds="blog-card" href=${this.href} class="ds-blog-card flex w-full flex-col border border-edge p-2"><span data-art aria-hidden="true" class="relative grid aspect-[5/4] grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden bg-ds-neutral-200 px-4 text-ds-neutral-300">${staticHtml`<${tag('grain')}></${tag('grain')}>`}<span class="ds-blog-tag absolute top-2.5 right-2.5 z-1 bg-home-red py-0.5 pl-0.75 text-tag-sm font-medium tracking-tag text-off-white">${this.category}</span><span class="pointer-events-none absolute inset-0 opacity-70">${staticHtml`<${tag('cell-burst')} seed=${seed} jumble></${tag('cell-burst')}>`}</span>${win ? html`<span class=${['absolute top-1/2 left-1/2 flex', this.seen.seen ? '' : 'invisible'].join(' ')} style=${`width: ${VIZ_W}px; height: ${VIZ_H}px; transform: translate(-50%, -50%) scale(${this.fit})`}><slot name="window" @slotchange=${() => this.requestUpdate()}></slot></span>` : nothing}</span><span class="mt-4 block px-2 text-card-title text-fg">${this.heading}</span>${this.dek ? html`<span class="mt-2 block px-2 text-body leading-5.5 text-fg-muted">${this.dek}</span>` : nothing}${this.author || this.date ? html`<span class="mt-auto flex items-center justify-between gap-4 px-2 pt-6 pb-2 type-meta text-fg-faint">${this.author ? html`<span class="border border-edge px-1.5 leading-5">${this.author}</span>` : nothing}${this.date ? html`<span class="ml-auto border border-edge px-1.5 leading-5 tabular-nums">${this.date}</span>` : nothing}</span>` : nothing}</a>`
	}
}

define('blog-card', BlogCard)
