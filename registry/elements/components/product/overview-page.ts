import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { ArrowRight, ChevronDown } from 'lucide'
import type { LineSeries } from '@/elements/components/ui/line-chart'
import type { QueryDay } from '@/elements/components/product/overview-queries'
import '@/elements/components/ui/button'
import '@/elements/components/ui/dot-matrix'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/ui/count'
import '@/elements/components/ui/table'
import '@/elements/components/visuals/cell-burst'
import '@/elements/components/visuals/grain'
import '@/elements/components/visuals/highlight-text'
import '@/elements/components/visuals/viz-window'
import '@/elements/components/product/overview-queries'
import styles from 'virtual:tw'

// OverviewPage.vue as <conare-overview-page>: Overview as it ships (Home.vue, take 7 with lead 5): what a team running Conare checks, with no search box. The line
// under the top bar while setup is unfinished; the greeting and how many documents agents search, with Create API key
// and Read the docs, beside the API key's window on the dark panel, the two in the website's double rule; Queries
// beside Credits; the five largest namespaces. Every value comes in through props; the buttons and rows fire events.
// The greeting has the website's letter reveal (highlight-text); the documents count up the first time in a session
// (count); the key window is built on the website's product window (VizWindow) over the grain and a sheet of cells,
// and plays again every 9s while the tab shows (never for reduced motion).
// Events: finish-setup, create-key, read-docs, billing, view-all and open-namespace ({ name }). `setup`, `queries`,
// `credits` and `namespaces` are JSON attributes or properties. The key window sits in a max-w-100 box (Vue's class on
// the window, which cannot reach its shadow root).
export interface OverviewNamespace { name: string, documents: number, health: 'ready' | 'syncing' | 'error' | 'api', synced?: string, lastUsed?: string }
export interface OverviewSpender { name: string, cost: number, share: number }
const num = (n: number) => n.toLocaleString('en-US')
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const pct = (p: number) => (p > 0 && p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`)
const arrow = () => icon(ArrowRight, 'arrow-right', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })

/**
 * @summary Overview as it ships: setup, the lead with the key window, Queries, Credits and the largest namespaces.
 * @fires finish-setup - Finish setup was pressed.
 * @fires create-key - Create API key was pressed.
 * @fires read-docs - Read the docs was pressed.
 * @fires billing - Billing was pressed.
 * @fires view-all - View all was pressed.
 * @fires open-namespace - A namespace row was pressed ({ name }).
 */
export class OverviewPage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { greeting: {}, documents: { type: Number }, setup: { type: Object }, queries: { type: Object }, credits: { type: Object }, namespaces: { type: Array }, keyRun: { state: true } }

	greeting = ''
	/** How many documents agents search. */
	documents = 0
	/** Setup's steps, while unfinished. */
	setup?: { done: number, total: number }
	queries: { thisMonth: number, p50: number, p95: number, days: QueryDay[], latency: LineSeries[] } = { thisMonth: 0, p50: 0, p95: 0, days: [], latency: [] }
	credits: { left: number, total: number, spenders: OverviewSpender[] } = { left: 0, total: 0, spenders: [] }
	namespaces: OverviewNamespace[] = []
	private keyRun = 0
	private keyLoop: ReturnType<typeof setInterval> | undefined

	connectedCallback() {
		super.connectedCallback()
		this.keyLoop = setInterval(() => {
			if (!document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) this.keyRun++
		}, 9000)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		clearInterval(this.keyLoop)
	}

	private renderKey() {
		return html`<div class="flex flex-col gap-3 px-4 pt-1 pb-4"><p class="ds-viz-in ml-10 bg-ds-neutral-200 px-3 py-2.5 text-ui" style="--d: 120"><span class="block type-code-sm text-ds-neutral-500">POST /query</span>How do refunds work?</p><p class="ds-viz-in flex items-center justify-end gap-1.5 text-meta text-ds-neutral-500" style="--d: 320"><span class="text-ds-neutral-600">API key</span> added to headers</p><div class="ds-viz-in ds-viz-progress" style="--d: 500"><span class="grid size-2.5 shrink-0 place-items-center"><span class="ds-viz-swap-a ds-viz-matrix [grid-area:1/1]" style="--d: 960">${Array.from({ length: 9 }, (_, i) => html`<i style="--k: ${i + 1}"></i>`)}</span><span class="ds-viz-swap-b ds-viz-dot bg-home-red [grid-area:1/1]" style="--d: 960"></span></span><span class="grid flex-1"><span class="ds-viz-swap-a [grid-area:1/1]" style="--d: 960">Calling the API</span><span class="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style="--d: 960">200 OK</span></span><span class="ds-viz-swap-b shrink-0 text-ds-neutral-500 tabular-nums" style="--d: 960">62 ms</span></div><p class="ds-viz-in text-ui leading-6" style="--d: 1080">Refunds are available for 30 days.</p><p class="ds-viz-in flex items-center gap-2 text-meta text-ds-neutral-500" style="--d: 1240">Source <span class="ds-viz-chip text-off-white"><span class="ds-viz-dot bg-home-red"></span>Refunds</span></p></div>`
	}

	render() {
		const { setup, credits, queries } = this
		const share = credits.total ? Math.max(0, Math.min(1, credits.left / credits.total)) : 0
		const top = [...this.namespaces].sort((a, b) => b.documents - a.documents).slice(0, 5)
		return html`<div data-ds="overview-page">${setup && setup.done < setup.total ? html`<section class="flex min-h-10 items-center gap-2.5 border-b border-edge bg-surface-subtle py-1.5 pr-3 pl-4 text-meta md:min-h-12" aria-label="what needs doing"><span class="size-1.5 shrink-0 bg-edge-accent" aria-hidden="true"></span><p class="min-w-0 flex-1">${`You haven't finished setting up Conare: ${setup.done} of ${setup.total} steps done.`}</p>${staticHtml`<${tag('pixel-button')} class="shrink-0" @click=${() => this.emit('finish-setup')}>Finish setup ${arrow()}</${tag('pixel-button')}>`}</section>` : nothing}<div class="mx-auto flex w-full max-w-page-wide flex-col gap-6 px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20"><section class="ds-ovlead" aria-label="your platform"><div class="flex min-w-0 flex-col items-start gap-2 bg-surface p-5">${staticHtml`<${tag('highlight-text')} as="h1" text=${this.greeting} accent="." class="type-heading-2"></${tag('highlight-text')}>`}<p class="max-w-[56ch] text-ui text-fg-muted">Help your agents search through ${staticHtml`<${tag('count')} .value=${this.documents} once="overview-documents"></${tag('count')}>`} documents.</p><div class="mt-auto flex w-full flex-row items-center gap-2 pt-6">${staticHtml`<${tag('pixel-button')} @click=${() => this.emit('create-key')}>Create API key</${tag('pixel-button')}><${tag('button')} @click=${() => this.emit('read-docs')}>Read the docs</${tag('button')}>`}</div></div><div class="relative flex min-h-84 items-center justify-center overflow-hidden bg-code-raised text-ds-neutral-300" aria-hidden="true">${staticHtml`<${tag('grain')}></${tag('grain')}>`}<div class="pointer-events-none absolute inset-0 opacity-70">${staticHtml`<${tag('cell-burst')} seed="17"></${tag('cell-burst')}>`}</div><div class="relative flex w-full items-center justify-center px-4 py-6"><div class="flex w-full max-w-100">${staticHtml`<${tag('viz-window')} active><span slot="title" class="contents"><span class="text-ui leading-4">Your code</span><span class="bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500">API</span></span>${repeat([this.keyRun], (k) => k, () => this.renderKey())}</${tag('viz-window')}>`}</div></div></div></section><div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_288px]">${staticHtml`<${tag('overview-queries')} .thisMonth=${queries.thisMonth} .p50=${queries.p50} .p95=${queries.p95} .days=${queries.days} .latency=${queries.latency}></${tag('overview-queries')}>`}<section class="flex min-w-0 flex-col border border-edge bg-surface" aria-labelledby="credits-title"><div class="flex items-center justify-between gap-3 border-b border-edge px-4 py-3"><h2 id="credits-title" class="type-ui-strong">Credits</h2><a href="#" class="ds-ovlink type-meta text-fg-muted" @click=${(e: Event) => { e.preventDefault(); this.emit('billing') }}>Billing</a></div><div class="flex flex-1 flex-col gap-3 p-4"><p><span class="text-heading-4 font-medium tabular-nums">${usd(credits.left)}</span> <span class="type-meta text-fg-muted">${`left of ${usd(credits.total)}`}</span></p><div class="h-1 bg-edge" role="meter" aria-valuenow=${Math.round(share * 100)} aria-valuemin="0" aria-valuemax="100" aria-label="credits left"><span class="block h-full bg-surface-inverse" style=${`width: ${share * 100}%`}></span></div><ul class="mt-auto divide-y divide-edge">${credits.spenders.map((s) => html`<li class="flex items-center justify-between gap-3 py-2 text-meta"><span class="min-w-0 truncate type-code-sm">${s.name}</span><span class="flex shrink-0 items-baseline"><span class="w-16 text-right tabular-nums">${usd(s.cost)}</span><span class="w-10 text-right text-fg-muted tabular-nums">${pct(s.share)}</span></span></li>`)}</ul></div></section></div><section class="flex min-w-0 flex-col gap-2" aria-labelledby="data-title"><div class="flex items-center justify-between gap-4"><h2 id="data-title" class="type-ui-strong">Namespaces</h2>${staticHtml`<${tag('button')} variant="ghost" @click=${() => this.emit('view-all')}>View all ${arrow()}</${tag('button')}>`}</div>${staticHtml`<${tag('table')} framed label="namespaces"><table><thead><tr><th>Name</th><th class="hidden md:table-cell">Health</th><th>Documents</th><th class="hidden md:table-cell">Last used</th><th class="w-8"><span class="sr-only">Open</span></th></tr></thead><tbody>${top.map((ns) => html`<tr class="is-link" @click=${() => this.emit('open-namespace', { name: ns.name })}><td class="whitespace-nowrap"><button type="button" class="type-code-sm text-left" @click=${(e: Event) => { e.stopPropagation(); this.emit('open-namespace', { name: ns.name }) }}>${ns.name}</button></td><td class="hidden whitespace-nowrap md:table-cell">${ns.health === 'error'
			? html`<span class="inline-flex items-center gap-1.5 bg-status-failed px-1.5 text-meta leading-5 text-status-failed-fg"><span class="size-1 bg-edge-accent"></span>needs attention</span>`
			: ns.health === 'syncing'
				? html`<span class="inline-flex items-center gap-1.5 bg-status-working px-1.5 text-meta leading-5 text-status-working-fg">${staticHtml`<${tag('dot-matrix')} tone="inverse"></${tag('dot-matrix')}>`}syncing</span>`
				: ns.health === 'ready'
					? html`<span class="text-fg-muted">${`Synced ${ns.synced}`}</span>`
					: html`<span class="text-fg-muted">By API</span>`}</td><td class="tabular-nums">${num(ns.documents)}</td><td class=${ns.lastUsed ? 'hidden whitespace-nowrap md:table-cell' : 'hidden whitespace-nowrap md:table-cell text-fg-muted'}>${ns.lastUsed ?? 'never'}</td><td class="text-right">${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'inline text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</td></tr>`)}</tbody></table></${tag('table')}>`}</section></div></div>`
	}
}

define('overview-page', OverviewPage)
