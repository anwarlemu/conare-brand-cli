import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import type { SearchOutcome, SearchRow } from '@/elements/components/product/searches-log'
import '@/elements/components/product/console-page'
import '@/elements/components/product/searches-log'
import '@/elements/components/ui/empty-state'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/ui/tabs'
import styles from 'virtual:tw'

// SearchesPage.vue as <conare-searches-page>: Searches as it ships (pages/dashboard/searches.vue, take 1, Log): what an
// agent asked and what it read. The page's one filter sits in its head (All, Weak match, Nothing found, Failed); the
// log under it, rows opening in place. With no searches yet, the dashed box says where they come from and Connect an
// agent leads there. Vue's v-model:show is `show` with a `change` event; the log's events (download, fix, search) pass
// on out as they are. The root is console-page's, drawn with data-ds="searches-page" (its `rootName`), as Vue's
// fallthrough data-ds does.
type Show = 'all' | Exclude<SearchOutcome, 'strong'>
const FILTERS: Array<{ value: Show, label: string }> = [{ value: 'all', label: 'All' }, { value: 'weak', label: 'Weak match' }, { value: 'none', label: 'Nothing found' }, { value: 'failed', label: 'Failed' }]

/**
 * @summary Searches: the filter in the page head, the log under it, or the empty state.
 * @fires change - The filter changed (read `show`).
 * @fires connect - Connect an agent was pressed.
 */
export class SearchesPage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { rows: { type: Array }, show: {} }

	/** The searches, newest first. */
	rows: SearchRow[] = []
	/** The filter: all, weak, none or failed (Vue's v-model:show). */
	show: Show = 'all'

	private filter(e: Event) {
		e.stopPropagation()
		this.show = (e.currentTarget as HTMLElement & { value: Show }).value
		this.emit('change')
	}

	render() {
		const shown = this.rows.filter((r) => this.show === 'all' || r.outcome === this.show)
		const body = !this.rows.length
			? staticHtml`<${tag('empty-state')} heading="No searches yet" description="Every search your agents run shows here, with what it read."><${tag('pixel-button')} @click=${() => this.emit('connect')}>Connect an agent</${tag('pixel-button')}></${tag('empty-state')}>`
			: !shown.length
				? html`<p class="type-meta text-fg-muted">No searches like this in the last few hours.</p>`
				: html`<div class="flex flex-col gap-3">${staticHtml`<${tag('searches-log')} .rows=${shown}></${tag('searches-log')}>`}</div>`
		return staticHtml`<${tag('console-page')} .rootName=${'searches-page'} heading="Searches">${this.rows.length ? staticHtml`<${tag('tabs')} slot="actions" .value=${this.show} .options=${FILTERS} label="which searches" @change=${this.filter}></${tag('tabs')}>` : nothing}${body}</${tag('console-page')}>`
	}
}

define('searches-page', SearchesPage)
