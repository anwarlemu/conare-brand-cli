import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { enter, measure, move } from '@/elements/lib/transition'
import { ArrowRight } from 'lucide'
import '@/elements/components/ui/count'
import styles from 'virtual:tw'

// OverviewBand.vue as <conare-overview-band>: what Conare is doing for a team, in one band above the numbers
// (overview/Band.vue), three answers to "is it working?". `pipeline`: the website's four steps (connect, sync, retrieve,
// deliver) with the team's numbers in a double rule, a broken step red where it broke; a step's number counts up the
// first time it shows in a session (count), with its `unit` after it. `questions`: what a buyer asks, each answered in
// a sentence. `live`: the website's dark panel, the last searches landing one at a time, once, and holding (hidden tabs
// wait; reduced motion shows them all). Each step, question and the live link goes where it points (`href`). `steps`,
// `questions` and `live` are JSON attributes or properties.
export type OverviewStep = { name: string, value: number | string, unit?: string, line: string, href?: string, red?: boolean }
export type OverviewQuestion = { question: string, answer: string, href?: string, red?: boolean }
export type OverviewSearch = { id: string, question: string, agent: string, took_ms: number, outcome: 'strong' | 'weak' | 'none' | (string & {}) }
export type OverviewLive = { value: string, line: string, link: string, href?: string, searches: OverviewSearch[] }

const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${n} ms`)
const arrow = (cls?: string) => icon(ArrowRight, 'arrow-right', { size: 12, strokeWidth: 1.5, class: cls, attrs: { 'aria-hidden': 'true' } })

/**
 * @summary Is it working: the pipeline, three questions, or searches landing live.
 */
export class OverviewBand extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { view: {}, steps: { type: Array }, questions: { type: Array }, live: { type: Object }, shown: { state: true } }

	view: 'pipeline' | 'questions' | 'live' = 'pipeline'
	steps: OverviewStep[] = []
	questions: OverviewQuestion[] = []
	/** The live panel: the big number, its sentence, the link under it and the searches, oldest first. */
	live?: OverviewLive
	private shown = 0
	private timer: ReturnType<typeof setInterval> | undefined
	private rects?: Map<unknown, DOMRect>

	private get rows() {
		return (this.live?.searches ?? []).slice(-6)
	}

	private play() {
		clearInterval(this.timer)
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches
		this.shown = still ? this.rows.length : 1
		if (still) return
		this.timer = setInterval(() => {
			if (document.hidden) return
			if (this.shown >= this.rows.length) return clearInterval(this.timer)
			this.shown += 1
		}, 900)
	}

	private logRows() {
		return [...this.renderRoot.querySelectorAll<HTMLElement>('.ds-livelog > li')].map((li) => [li.dataset.id, li] as [unknown, HTMLElement])
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if ((changed.has('live') || changed.has('view')) && this.view === 'live' && this.rows.length && this.hasUpdated) this.play()
		// Where the landed rows are before a new one comes in (TransitionGroup's move).
		if (changed.has('shown')) this.rects = measure(this.logRows())
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		if (this.view === 'live' && this.rows.length) this.play()
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('shown') || !this.rects) return
		const rows = this.logRows()
		// A row that came in enters (it lands after the first render, as in Vue's TransitionGroup).
		for (const [id, li] of rows) if (!this.rects.has(id)) void enter(li, 'ds-livelog')
		move(rows, this.rects, 'ds-livelog')
		this.rects = undefined
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		clearInterval(this.timer)
	}

	render() {
		if (this.view === 'pipeline') {
			return html`<section data-ds="overview-band" class="ds-pipeline" aria-label="what Conare is doing">${this.steps.map((s) => {
				const inner = html`<span class="type-meta text-fg-muted">${s.name}</span><span class="ds-pipeline-num">${typeof s.value === 'number' ? staticHtml`<${tag('count')} .value=${s.value} once=${`pipeline-${s.name}`}></${tag('count')}>` : s.value}${s.unit ?? ''}</span><span class="ds-pipeline-line type-meta text-fg-muted">${s.line}</span>`
				return s.href
					? html`<a href=${s.href} class="ds-pipeline-step" ?data-red=${!!s.red}>${inner}</a>`
					: html`<div class="ds-pipeline-step" ?data-red=${!!s.red}>${inner}</div>`
			})}</section>`
		}
		if (this.view === 'questions') {
			return html`<section data-ds="overview-band" class="ds-questions border border-edge bg-surface" aria-label="three questions">${this.questions.map((q) => {
				const inner = html`<span class="ds-questionrow-q type-meta text-fg-muted">${q.question}</span><span class="ds-questionrow-a min-w-0 flex-1">${q.answer}</span>${q.href ? arrow('shrink-0 text-fg-muted') : nothing}`
				return q.href
					? html`<a href=${q.href} class="ds-questionrow" ?data-red=${!!q.red}>${inner}</a>`
					: html`<div class="ds-questionrow" ?data-red=${!!q.red}>${inner}</div>`
			})}</section>`
		}
		const live = this.live
		if (!live) return nothing
		// Newest on top.
		const landed = this.rows.slice(0, this.shown).reverse()
		const link = html`${`${live.link} `}${arrow()}`
		return html`<section data-ds="overview-band" class="ds-liveband" aria-label="searches as they land"><div class="ds-liveband-side"><p class="ds-liveband-num">${live.value}</p><p class="ds-liveband-say">${live.line}</p>${live.href ? html`<a href=${live.href} class="ds-liveband-link">${link}</a>` : html`<span class="ds-liveband-link">${link}</span>`}</div><ol class="ds-livelog" aria-live="off">${repeat(landed, (r) => r.id, (r) => html`<li data-id=${r.id}><span class="min-w-0 flex-1 truncate">${r.question}</span><span class="ds-livelog-agent">${r.agent}</span><span class="ds-livelog-ms">${ms(r.took_ms)}</span><span class="ds-livelog-dot" data-outcome=${r.outcome} aria-hidden="true"></span><span class="sr-only">${r.outcome}</span></li>`)}</ol></section>`
	}
}

define('overview-band', OverviewBand)
