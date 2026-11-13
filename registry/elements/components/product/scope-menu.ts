import { html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { Check, ChevronDown, Database, Layers } from 'lucide'
import { define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Combobox, type ComboOption } from '@/elements/components/ui/combobox'
import styles from 'virtual:tw'

// ScopeMenu.vue as <conare-scope-menu>: where a search looks: every namespace, or one. The button is the search bar's
// 28px chip (.v2-scope), the namespace in mono once one is picked, a 12px chevron that turns over as it opens. The
// 288px panel lists Every namespace over a hairline, then each namespace with its mark (its app's logo, or `own-mark`
// for a namespace written by API or upload), its name in mono and its size, the pick checked; a filter shows past six.
// `single`: a namespace must be chosen, so there is no Every namespace. It extends <conare-combobox>: `namespaces` is
// Vue's `options` ({ name, documents, logo }), and v-model is `value` with `input` and `change`.
export interface ScopeOption { name: string, documents: number, logo?: string | null }
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/**
 * @summary Where a search looks: every namespace, or one.
 * @fires input - The scope changed (read `value`).
 * @fires change - The scope changed (read `value`).
 */
export class ScopeMenu extends Combobox {
	static styles = [Combobox.styles, styles]
	static properties = { ...Combobox.properties, namespaces: { type: Array }, single: { type: Boolean }, ownMark: { attribute: 'own-mark' } }

	/** The namespaces: { name, documents, logo } (a JSON attribute or the property). */
	namespaces: ScopeOption[] = []
	/** A namespace must be chosen: no Every namespace. */
	single = false
	/** The mark for a namespace with no app (written by API or upload). */
	ownMark?: string

	constructor() {
		super()
		this.filter = 'auto'
		this.filterLabel = 'Filter namespaces'
		this.width = '288px'
	}
	protected willUpdate(changed: PropertyValues<this>) {
		super.willUpdate(changed)
		if (changed.has('namespaces') || changed.has('single')) {
			const total = this.namespaces.reduce((a, o) => a + o.documents, 0)
			this.options = [
				...(this.single ? [] : [{ value: '', label: 'Every namespace', hint: compact.format(total), pinned: true }]),
				...this.namespaces.map((o) => ({ value: o.name, label: o.name, hint: compact.format(o.documents) })),
			]
			this.label = this.single ? 'add to' : 'search in'
			this.disabled = !this.namespaces.length
		}
	}
	private logoOf(name: string | number) {
		return this.namespaces.find((o) => o.name === name)?.logo ?? null
	}
	protected triggerClasses() {
		return 'group inline-flex h-control-sm max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui cursor-pointer items-center gap-1.5 border border-edge bg-surface-subtle px-2 text-meta text-fg transition-[border-color] duration-120 ease-standard hover:border-edge-focus aria-expanded:border-edge-focus aria-expanded:bg-surface active:enabled:bg-surface-subtle disabled:cursor-not-allowed disabled:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-edge-focus'
	}
	protected renderTrigger(): TemplateResult {
		const scope = this.value
		const logo = this.logoOf(scope)
		const label = scope || (this.single ? 'Choose a namespace' : 'every namespace')
		return html`${logo ? html`<img src=${logo} alt="" width="12" height="12" class="size-3 object-contain">` : icon(Database, 'database', { size: 12, strokeWidth: 1.5, class: 'text-fg-muted', attrs: { 'aria-hidden': 'true' } })}<span class="sr-only">${this.single ? 'add to' : 'search in'}</span><span class=${scope ? 'max-w-45 truncate type-code-sm' : 'max-w-45 truncate'}>${label}</span>${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'text-fg-muted transition-[rotate] duration-120 ease-out group-aria-expanded:rotate-180 group-aria-expanded:duration-180 motion-reduce:transition-none', attrs: { 'aria-hidden': 'true' } })}`
	}
	protected renderOption(o: ComboOption, selected: boolean): TemplateResult {
		const logo = this.logoOf(o.value)
		const mark = o.pinned
			? icon(Database, 'database', { size: 14, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })
			: logo
				? html`<img src=${logo} alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">`
				: this.ownMark
					? html`<img src=${this.ownMark} alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">`
					: icon(Layers, 'layers', { size: 14, strokeWidth: 1.5, class: 'shrink-0 text-fg', attrs: { 'aria-hidden': 'true' } })
		return html`${mark}<span class=${o.pinned ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate type-code-sm'}>${o.label}</span><span class="min-w-10 text-right text-meta text-fg-muted tabular-nums">${o.hint ?? nothing}</span>${icon(Check, 'check', { size: 14, strokeWidth: 1.5, class: selected ? 'shrink-0' : 'shrink-0 invisible', attrs: { 'aria-hidden': 'true' } })}`
	}
	protected renderEmpty(query: string) {
		return `No namespace matches "${query}".`
	}
}

define('scope-menu', ScopeMenu)
