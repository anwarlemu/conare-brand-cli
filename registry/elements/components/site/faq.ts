import { nothing, type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import '@/elements/components/ui/site-tag'
import styles from 'virtual:tw'

// Faq.vue as <conare-faq>: the website's questions in the double-rule frame. From md, the list and one answer beside
// it: every answer shares one grid cell, so the panel is as tall as the longest and opening a question never pushes the
// page. The open question keeps its ground (paper, the red square) and glides to the next one opened on transform
// alone; the pointer has its own lighter ground that follows it across the other questions, appears where the pointer
// is and fades when it leaves. Arrow keys, Home and End move between questions. On phones it is an accordion: each
// answer opens under its question, one at a time, a second tap closes it, and a red plus turns to a minus. Vue's
// `title` is `heading`.

/** @summary The website's questions: a list with one answer beside it, an accordion on phones. */
export class Faq extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { items: { type: Array }, heading: {}, tag: {}, active: { state: true }, open: { state: true }, hot: { state: true }, rows: { state: true }, snap: { state: true } }

	/** [{ q, a }]. */
	items: { q: string, a: string }[] = []
	/** The section's title (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = 'Frequently asked questions'
	/** The tag over the title. */
	tag = 'FAQ'
	private active = 0
	private open: number | null = 0
	private hot: number | null = null
	private rows: { y: number, h: number }[] = []
	private snap = false
	private uid = uid('faq')
	private ro?: ResizeObserver

	private get hovering() {
		return this.hot !== null && this.hot !== this.active
	}
	private get tabs() {
		return [...this.renderRoot.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
	}
	private measure() {
		this.rows = this.tabs.map((el) => ({ y: el.offsetTop, h: el.offsetHeight }))
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.ro?.disconnect()
	}
	protected willUpdate(changed: PropertyValues) {
		// Vue's watch(hovering): the pointer's ground starts where it is instead of gliding in.
		if (changed.has('hot') || changed.has('active')) {
			const was = (changed.has('hot') ? changed.get('hot') : this.hot) as number | null
			const wasActive = (changed.has('active') ? changed.get('active') : this.active) as number
			const before = was !== null && was !== undefined && was !== wasActive
			if (this.hovering && !before) {
				this.snap = true
				requestAnimationFrame(() => requestAnimationFrame(() => { this.snap = false }))
			}
		}
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('items')) {
			this.measure()
			this.ro?.disconnect()
			this.ro = new ResizeObserver(() => this.measure())
			this.tabs.forEach((t) => this.ro!.observe(t))
		}
	}

	private onKey(e: KeyboardEvent) {
		const n = this.items.length
		const a = this.active
		const next = e.key === 'ArrowDown' ? (a + 1) % n : e.key === 'ArrowUp' ? (a - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null
		if (next === null) return
		e.preventDefault()
		this.active = next
		this.tabs[next]?.focus()
	}

	render() {
		const items = this.items ?? []
		const u = this.uid
		const siteTag = tag('site-tag')
		const cur = this.rows.length ? this.rows[this.hot ?? this.active] : undefined
		const at = this.rows.length ? this.rows[this.active] : undefined
		return html`<section data-ds="faq" aria-labelledby=${`${u}-title`} class="mx-auto max-w-[1440px] scroll-mt-16 px-4 pt-12 pb-32 sm:px-6 lg:px-10 lg:pt-16 lg:pb-40">
			<div class="mx-auto max-w-[1200px]">
				<p class="mb-4 flex justify-center"><${siteTag}>${this.tag}</${siteTag}></p>
				<h2 id=${`${u}-title`} class="ds-faq-title text-center font-heading text-heading-2 font-normal tracking-tight sm:text-heading-1">${this.heading}</h2>

				<!-- Phones: the accordion, in the same double rule. -->
				<ul class="mt-8 border border-edge outline outline-offset-4 outline-edge md:hidden">
					${items.map((f, i) => html`<li class="ds-faq-item border-t border-edge first:border-t-0" data-open=${String(i === this.open)}>
						<h3 class="font-heading font-normal">
							<button id=${`${u}-q-${i}`} type="button" aria-expanded=${String(i === this.open)} aria-controls=${`${u}-a-${i}`} class=${['ds-faq-row relative flex w-full items-center justify-between gap-4 py-4 pr-5 pl-5 text-left text-body-lg', i === this.open ? 'text-fg' : 'text-fg-muted'].join(' ')} @click=${() => { this.open = i === this.open ? null : i }}>
								${f.q}
								<span aria-hidden="true" class="relative size-3 shrink-0">
									<span class="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-home-red"></span>
									<span class="ds-faq-sign-v absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-home-red"></span>
								</span>
							</button>
						</h3>
						<div id=${`${u}-a-${i}`} role="region" aria-labelledby=${`${u}-q-${i}`} ?inert=${i !== this.open} data-open=${String(i === this.open)} class="ds-faq-acc grid">
							<div class="min-h-0 overflow-hidden">
								<p class="px-5 pb-5 text-input leading-6.5 text-fg-muted">${f.a}</p>
							</div>
						</div>
					</li>`)}
				</ul>

				<!-- From md: the list and the answer beside it, in the double rule. -->
				<div class="mt-8 hidden border border-edge outline outline-offset-4 outline-edge md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
					<div role="tablist" aria-label=${this.heading} aria-orientation="vertical" class="relative flex flex-col border-b border-edge md:border-r md:border-b-0" @keydown=${(e: KeyboardEvent) => this.onKey(e)} @mouseleave=${() => { this.hot = null }}>
						<!-- Until the rows are measured the open row carries its own ground, so the first paint is right. -->
						${cur && at
							? html`<span aria-hidden="true" class="ds-faq-hover pointer-events-none absolute inset-x-0 top-0 bg-home-grey" data-on=${String(this.hovering)} data-snap=${String(this.snap)} style=${`height: ${cur.h}px; transform: translateY(${cur.y}px)`}></span><span aria-hidden="true" class="ds-faq-mark pointer-events-none absolute inset-x-0 top-0 flex items-center justify-end bg-surface-subtle pr-5 sm:pr-6" style=${`height: ${at.h}px; transform: translateY(${at.y}px)`}><span class="size-2 bg-home-red"></span></span>`
							: nothing}
						${items.map((f, i) => html`<button
							id=${`${u}-tab-${i}`}
							role="tab"
							type="button"
							aria-controls=${`${u}-panel-${i}`}
							aria-selected=${String(i === this.active)}
							tabindex=${i === this.active ? '0' : '-1'}
							class=${['ds-faq-row relative border-t border-edge py-4 pr-12 pl-5 text-left text-body-lg first:border-t-0 sm:pl-6', i === this.active || i === this.hot ? 'text-fg' : 'text-fg-muted', i === this.active && !this.rows.length ? 'bg-surface-subtle' : ''].join(' ')}
							@mouseenter=${() => { this.hot = i }}
							@pointerdown=${(e: PointerEvent) => { if (e.button === 0) this.active = i }}
							@click=${() => { this.active = i }}
						>${f.q}</button>`)}
					</div>

					<div class="grid grid-cols-[minmax(0,1fr)]">
						${items.map((f, i) => html`<div id=${`${u}-panel-${i}`} role="tabpanel" aria-labelledby=${`${u}-tab-${i}`} ?inert=${i !== this.active} data-active=${String(i === this.active)} class="ds-faq-panel min-w-0 px-5 py-6 [grid-area:1/1] sm:px-8 sm:py-8"><p class="type-heading-3 text-fg">${f.q}</p><p class="mt-3 max-w-[560px] text-input leading-6.5 text-fg-muted">${f.a}</p></div>`)}
					</div>
				</div>
			</div>
		</section>`
	}
}

define('faq', Faq)
