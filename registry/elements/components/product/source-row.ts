import { nothing } from 'lit'
import { html } from 'lit/static-html.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { RefreshCw } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/product/app-mark'
import '@/elements/components/ui/tag'
import styles from 'virtual:tw'

// SourceRow.vue as <conare-source-row>: a source that writes into a namespace, as getting started lists it (the
// console's Source.vue): its app's mark and its name, linking to the source, then its sync's state as a tag: how often
// it syncs when ready (with the turn arrows), black with a 4px square while it syncs or connects, the red wash when it
// needs attention, "via API" for a source pushed through the API. `detail` adds the last and next sync. The tag's title
// says what the state means. The name is a link (Vue's `as` router link has no counterpart without a framework).
export type SourceStatus = 'ready' | 'syncing' | 'connecting' | 'error' | 'pushed'

const STATES: Record<SourceStatus, { label: string, tone: 'default' | 'working' | 'failed' | 'quiet', note: string }> = {
	ready: { label: 'auto-sync', tone: 'quiet', note: 'Syncs automatically on a schedule.' },
	syncing: { label: 'syncing', tone: 'working', note: 'A sync is running. It syncs automatically on a schedule.' },
	connecting: { label: 'connecting', tone: 'working', note: 'Waiting for the app account to be connected. Then it syncs automatically.' },
	error: { label: 'needs attention', tone: 'failed', note: 'The last sync failed. Open the source to see why.' },
	pushed: { label: 'via API', tone: 'quiet', note: 'Its documents are pushed through the API.' },
}

/**
 * @summary A source in a namespace: its app's mark and name, and its sync's state.
 * @fires open - The name was pressed; detail { event } (call event.preventDefault() to stay on the page).
 */
export class SourceRow extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { name: {}, app: {}, logo: {}, status: {}, every: {}, synced: {}, next: {}, detail: { type: Boolean }, href: {} }

	/** The source's name. */
	name = ''
	/** Its app's name. */
	app = ''
	/** Its app's logo. */
	logo?: string | null
	/** ready, syncing, connecting, error or pushed. */
	status: SourceStatus = 'ready'
	/** How often it syncs when ready ("every 6 hours"). */
	every?: string
	/** When it last synced, already worded ("2 hours ago"). */
	synced?: string
	/** When it will next ("in 4 hours"). */
	next?: string
	/** Adds the last and next sync. */
	detail = false
	/** The source's page. */
	href?: string

	// Text that Vue renders as one node is one node here too ("synced 2 hours ago"): split, it measures a hair wider.
	render() {
		const base = STATES[this.status] ?? STATES.ready
		const state = this.status === 'ready' && this.every ? { ...base, label: `syncs ${this.every}` } : base
		const title = [state.note, this.synced ? `Last sync ${this.synced}.` : '', this.next && this.status === 'ready' ? `Next sync ${this.next}.` : ''].filter(Boolean).join(' ')
		const t = tag('tag')
		const mark = tag('app-mark')
		const lead = this.status === 'ready'
			? icon(RefreshCw, 'refresh-cw', { size: 10, strokeWidth: 2, class: 'mt-0.5', attrs: { 'aria-hidden': 'true', slot: 'mark' } })
			: state.tone === 'working' ? html`<span slot="mark" class="mt-0.5 size-1 shrink-0 animate-pulse bg-surface motion-reduce:animate-none" aria-hidden="true"></span>` : nothing
		return html`<span data-ds="source-row" class="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-ui">
			<a href=${this.href ?? '#'} class="ds-source-name" title=${ifDefined(this.app === this.name ? undefined : this.app)} @click=${(event: MouseEvent) => this.emit('open', { event })}>
				<${mark} .name=${this.app} .logo=${this.logo}></${mark}>
				<span>${this.name}</span>
			</a>
			<${t} .tone=${state.tone} title=${title}>${lead}${state.label}</${t}>
			${this.detail && this.synced ? html`<span class="type-meta whitespace-nowrap text-fg-muted">${`synced ${this.synced}`}</span>` : nothing}
			${this.detail && this.next && this.status === 'ready' ? html`<span class="type-meta whitespace-nowrap text-fg-muted">${`next ${this.next}`}</span>` : nothing}
		</span>`
	}
}

define('source-row', SourceRow)
