import { html, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { enter, leave } from '@/elements/lib/transition'
import { formatNumber } from '@/elements/controllers/chart'
import type { LineSeries } from '@/elements/components/ui/line-chart'
import '@/elements/components/ui/bar-chart'
import '@/elements/components/ui/line-chart'
import '@/elements/components/ui/tabs'
import styles from 'virtual:tw'

// OverviewQueries.vue as <conare-overview-queries>: Overview's Queries card (platform/Queries.vue): volume or latency, three numbers over the chart (the chart item:
// BarChart for queries per day, LineChart for the last 24 hours' latency). Pointing at a number shows its part (this
// month's bars, today's bar, or the latency); a press pins it, with a 2px red edge. Nothing navigates: the chart changes
// in place, crossing over in 200ms. `latency` is the chart's series (p50, p95), each point a time and milliseconds.
export interface QueryDay { day: string, value: number }
type Stat = '' | 'month' | 'today' | 'latency'
type View = 'volume' | 'latency'
const ms = (v: number) => `${Math.round(v)} ms`

/**
 * @summary Overview's Queries card: three numbers over the volume or latency chart.
 */
export class OverviewQueries extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { thisMonth: { type: Number, attribute: 'this-month' }, p50: { type: Number }, p95: { type: Number }, days: { type: Array }, latency: { type: Array }, chart: { state: true }, pinned: { state: true }, hot: { state: true }, shown: { state: true } }

	thisMonth = 0
	p50 = 0
	p95 = 0
	days: QueryDay[] = []
	/** The latency chart's series (p50, p95): points of a time and milliseconds. */
	latency: LineSeries[] = []
	private chart: View = 'volume'
	private pinned: Stat = ''
	private hot: Stat = ''
	// Vue's <Transition mode="out-in"> keyed by the view: the chart shown leaves, then the next enters.
	private shown: View = 'volume'
	private swapping = false

	private get active(): Stat {
		return this.hot || this.pinned
	}
	private get view(): View {
		const a = this.active
		return a === 'latency' ? 'latency' : a ? 'volume' : this.chart
	}
	private pin(stat: Exclude<Stat, ''>) {
		this.pinned = this.pinned === stat ? '' : stat
		this.chart = stat === 'latency' ? 'latency' : 'volume'
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (this.view === this.shown || this.swapping) return
		const box = this.renderRoot.querySelector<HTMLElement>('[data-chart]')
		if (!box) {
			this.shown = this.view
			return
		}
		this.swapping = true
		void leave(box, 'ds-ovchart').then(async () => {
			this.shown = this.view
			await this.updateComplete
			this.swapping = false
			const next = this.renderRoot.querySelector<HTMLElement>('[data-chart]')
			if (next) void enter(next, 'ds-ovchart')
			this.requestUpdate()
		})
	}

	private renderChart() {
		const days = this.days
		const a = this.active
		const today = days.at(-1)?.value ?? 0
		const month = days.at(-1)?.day.slice(0, 7) ?? ''
		const focus = a === 'today' ? (days.length ? [days.length - 1] : []) : a === 'month' ? days.flatMap((d, i) => (d.day.startsWith(month) ? [i] : [])) : undefined
		const note = a === 'today' ? `Today ${formatNumber(today)}` : a === 'month' ? `${new Date(`${month}-01T00:00:00Z`).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} so far` : undefined
		if (this.shown === 'volume' && days.some((d) => d.value > 0)) return staticHtml`<${tag('bar-chart')} .points=${days} label="Queries per day" height="192" .lit=${focus} .note=${note}></${tag('bar-chart')}>`
		if (this.shown === 'volume') return html`<p class="py-8 text-center type-meta text-fg-muted">No queries yet.</p>`
		if (this.latency.some((l) => l.points.length)) return staticHtml`<${tag('line-chart')} heading="Search latency, last 24 hours" .series=${this.latency} .format=${ms} smooth="3" height="192" bare></${tag('line-chart')}>`
		return html`<p class="py-8 text-center type-meta text-fg-muted">No searches in the last 24 hours.</p>`
	}

	render() {
		const today = this.days.at(-1)?.value ?? 0
		const a = this.active
		const stats = [['month', 'This month', formatNumber(this.thisMonth)], ['today', 'Today', formatNumber(today)], ['latency', 'Search p50, 24 h', `${this.p50} ms`]] as const
		return html`<section data-ds="overview-queries" class="min-w-0 border border-edge bg-surface" aria-labelledby="queries-title"><div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-edge px-4 py-3"><h2 id="queries-title" class="type-ui-strong">Queries</h2>${staticHtml`<${tag('tabs')} .value=${this.view} .options=${[{ value: 'volume', label: 'Volume' }, { value: 'latency', label: 'Latency' }]} label="chart" @change=${(e: Event) => { this.chart = (e.currentTarget as HTMLElement & { value: View }).value; this.pinned = '' }}></${tag('tabs')}>`}</div><div class="flex flex-col gap-4 p-4"><div class="grid grid-cols-2 border-t border-l border-edge sm:grid-cols-3">${stats.map((s) => html`<button type="button" class="ds-ovstat" aria-pressed=${String(this.pinned === s[0])} ?data-on=${a === s[0]} @click=${() => this.pin(s[0])} @pointerenter=${() => { this.hot = s[0] }} @pointerleave=${() => { this.hot = '' }}><span class="block type-meta text-fg-muted">${s[1]}</span><span class="block text-heading-4 font-medium tabular-nums">${s[2]}${s[0] === 'latency' ? html`<span class="ml-2 type-meta text-fg-muted">${`p95 ${this.p95} ms`}</span>` : ''}</span></button>`)}</div>${repeat([this.shown], (v) => v, () => html`<div data-chart>${this.renderChart()}</div>`)}</div></section>`
	}
}

define('overview-queries', OverviewQueries)
