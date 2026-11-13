import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import '@/elements/components/ui/site-tag'
import '@/elements/components/visuals/highlight-text'
import '@/elements/components/visuals/burst'
import '@/elements/components/visuals/grain'
import '@/elements/components/visuals/room-grid'
import styles from 'virtual:tw'

// Hero.vue as <conare-hero>: the home's first band (Hero.vue, UseCases.vue): the eyebrow tag, the headline in Faculty Glyphic with its red stop
// and its letter reveal (highlight-text: faint red letters settling to ink, once, as it comes on screen), one line, the
// one action (a button-link), then the red frame: a room in one-point perspective with the burst's slabs, under the
// grain, in a triple grey rule, with the window (the `window` slot) in front at up to 600px. The parts above settle up
// 12px in turn (320ms, 60ms apart). With `tabs`, the teams stand on the frame's top as stepped-corner tabs; the picked
// one is red, and a line along its foot fills over `turn` ms as the timer, handing over to the next team. The timer
// runs only while the frame is on screen, pauses while a pointer rests on it, and never runs for reduced motion.
// Vue's v-model is `value` (the picked tab) with `input` and `change`. Tab `mark` is an optional pixel pattern: a path on a 16px square.
// `heading` is Vue's `title`; the `title` slot draws the headline otherwise. The window goes in the `window` slot;
// read `value` (or listen for `change`) to show the picked team's. `tabs` is a JSON attribute or a property.

/**
 * @summary The home's first band: the headline, one action and the red frame with its window.
 * @slot title - The headline drawn as you like, in place of the revealed heading.
 * @slot action - The one action: a button-link.
 * @slot window - The window in the frame (show the picked tab's: read `value`).
 * @fires input - A tab was picked (read `value`).
 * @fires change - A tab was picked (read `value`).
 */
export class Hero extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { eyebrow: {}, heading: {}, accent: {}, body: {}, tabs: { type: Array }, tabsLabel: { attribute: 'tabs-label' }, turn: { type: Number }, value: { type: Number }, inView: { state: true }, still: { state: true }, run: { state: true } }

	/** The tag above the headline. */
	eyebrow?: string
	/** The headline (Vue's `title`), revealed letter by letter. */
	heading = ''
	/** Trailing characters that stay red. */
	accent = '.'
	/** The one line under the headline. */
	body?: string
	/** The teams on the frame's top: { label, mark? }. */
	tabs: { label: string, mark?: string }[] = []
	tabsLabel = 'Team'
	/** How long each team holds, in ms. */
	turn = 6000
	/** The picked tab's index. */
	value = 0
	private inView = false
	private still = false
	// Each pick restarts the timer.
	private run = 0
	private uid = uid('hero')
	private io?: IntersectionObserver

	private pick(i: number) {
		if (i === this.value) return
		this.commit(i)
		this.run++
	}
	private next() {
		this.commit((this.value + 1) % this.tabs.length)
		this.run++
	}
	private onKey = (e: KeyboardEvent) => {
		const n = this.tabs.length
		const a = this.value
		const to = e.key === 'ArrowRight' ? (a + 1) % n : e.key === 'ArrowLeft' ? (a - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null
		if (to === null) return
		e.preventDefault()
		this.pick(to)
		;(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus()
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		this.still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		const stage = this.renderRoot.querySelector('.ds-hero-stage')
		if (!stage || !('IntersectionObserver' in window)) {
			this.inView = true
			return
		}
		this.io = new IntersectionObserver(([e]) => { this.inView = !!e?.isIntersecting })
		this.io.observe(stage)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.io?.disconnect()
	}

	render() {
		const id = this.uid
		const tabs = this.tabs
		const active = this.value
		const timed = tabs.length > 1 && this.turn > 0
		return html`<section data-ds="hero" aria-labelledby=${`${id}-title`} class="ds-hero mx-auto max-w-[1440px] px-4 pt-24 pb-24 sm:px-6 lg:px-10 lg:pt-32"><div class="flex flex-col items-center text-center">${this.eyebrow ? html`<p class="ds-settle mb-4 flex justify-center">${staticHtml`<${tag('site-tag')}>${this.eyebrow}</${tag('site-tag')}>`}</p>` : nothing}${this.hasSlot('title')
			? html`<h1 id=${`${id}-title`} class="ds-hero-title font-heading text-hero font-normal tracking-display sm:text-display"><slot name="title"></slot></h1>`
			: staticHtml`<${tag('highlight-text')} id=${`${id}-title`} as="h1" text=${this.heading} accent=${this.accent} class="ds-hero-title font-heading text-hero font-normal tracking-display sm:text-display"></${tag('highlight-text')}>`}${this.body ? html`<p class="ds-settle mt-4 max-w-[600px] text-input text-balance text-fg-muted" style="--i: 1">${this.body}</p>` : nothing}${this.hasSlot('action') ? html`<div class="ds-settle mt-8" style="--i: 2"><slot name="action"></slot></div>` : nothing}</div><div class="ds-hero-stage mt-10 w-full lg:mt-14" data-running=${String(this.inView && !this.still)} style=${`--turn: ${this.turn}ms`}>${tabs.length ? html`<div role="tablist" aria-label=${this.tabsLabel} class="relative z-10 -mb-px flex items-end gap-px sm:justify-center sm:gap-1" @keydown=${this.onKey}>${tabs.map((t, i) => html`<button id=${`${id}-tab-${i}`} role="tab" type="button" aria-selected=${String(i === active)} aria-controls=${`${id}-window`} tabindex=${i === active ? 0 : -1} class="ds-hero-tab relative flex h-8 min-w-0 flex-1 basis-0 items-center justify-center gap-2 overflow-hidden px-0.5 text-caption leading-4 whitespace-nowrap sm:h-9 sm:px-2 sm:text-ui md:w-36 md:flex-none md:px-4" data-on=${String(i === active)} @pointerdown=${(e: PointerEvent) => { if (e.button === 0) this.pick(i) }} @click=${() => this.pick(i)}><span aria-hidden="true" class="ds-hero-tab-edge absolute inset-0"></span><span aria-hidden="true" class="ds-hero-tab-ground absolute inset-px"></span>${t.mark ? html`<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" class="ds-hero-tab-mark relative size-3.5 shrink-0 max-sm:hidden"><path d=${t.mark} class="fill-current"></path></svg>` : nothing}<span class="relative">${t.label}</span>${i === active && timed ? html`<span aria-hidden="true" class="absolute inset-x-px bottom-px h-0.5 overflow-hidden">${repeat([this.run], (r) => r, () => html`<span class="ds-hero-fill block h-full bg-off-white" @animationend=${() => this.next()}></span>`)}</span>` : nothing}</button>`)}</div>` : nothing}<div class="relative -mx-2.5 border border-edge-strong p-2.25"><div class="ds-hero-frame relative"><div class="relative flex w-full justify-center overflow-hidden border border-edge-strong bg-home-red px-4 py-10 text-ds-neutral-300 sm:px-8 sm:py-16 lg:py-20">${staticHtml`<${tag('grain')}></${tag('grain')}><${tag('room-grid')}></${tag('room-grid')}><${tag('burst')} inner="0.01" corners></${tag('burst')}>`}<div class="relative w-full max-w-[600px]"><div id=${`${id}-window`} data-burst-clear class="relative z-10 w-full" role=${tabs.length ? 'tabpanel' : nothing} aria-labelledby=${tabs.length ? `${id}-tab-${active}` : nothing}><slot name="window"></slot></div></div></div></div></div></div></section>`
	}
}

define('hero', Hero)
