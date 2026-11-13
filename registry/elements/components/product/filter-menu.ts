import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { Check, ListFilter } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/menu'
import '@/elements/components/ui/menu-item'
import '@/elements/components/ui/menu-label'
import '@/elements/components/ui/menu-separator'
import styles from 'virtual:tw'

// FilterMenu.vue as <conare-filter-menu>: every filter in one menu from the search box's bar (search/FilterMenu.vue):
// the scope chip's button (.v2-scope) reading Filters, with a count on ink (.v2-filter-count) once any is on, and a
// 240px menu of radio groups, each under its label. A second press on what is chosen clears it; the menu stays open
// for the next pick. v-model is `value` (each group's key to its value, '' or 0 for none; a JSON attribute or the
// property) with `input` and `change` events; `groups` is a JSON attribute or the property.
export interface FilterGroup { key: string, label: string, options: Array<{ value: string | number, label: string }> }
export type FilterValues = Record<string, string | number>

/**
 * @summary Every filter in one menu, counted on its button.
 * @fires input - A filter changed (read `value`).
 * @fires change - A filter changed (read `value`).
 */
export class FilterMenu extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { groups: { type: Array }, value: { type: Object } }

	groups: FilterGroup[] = []
	/** Each group's key to its value. */
	value: FilterValues = {}

	private pick(key: string, v: string | number) {
		this.commit({ ...this.value, [key]: this.value[key] === v ? (typeof v === 'number' ? 0 : '') : v })
	}

	render() {
		const menu = tag('menu')
		const item = tag('menu-item')
		const label = tag('menu-label')
		const sep = tag('menu-separator')
		const count = this.groups.filter((g) => this.value[g.key]).length
		return html`${staticHtml`<${menu} data-ds="filter-menu" label="filters" width="240px">
			<button slot="trigger" type="button" class="inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-edge bg-surface-subtle px-2 text-meta text-fg transition-[border-color] duration-120 ease-standard hover:border-edge-focus aria-expanded:border-edge-focus aria-expanded:bg-surface active:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-edge-focus">
				${icon(ListFilter, 'list-filter', { size: 12, strokeWidth: 1.5, class: 'text-fg-muted', attrs: { 'aria-hidden': 'true' } })}
				${'Filters'}${count ? html`<span class="inline-flex h-4 min-w-4 items-center justify-center bg-surface-inverse px-1 text-caption leading-4 text-fg-inverse tabular-nums">${count}</span>` : nothing}
			</button>
			<div class="flex max-h-88 flex-col overflow-y-auto">
				${this.groups.map((g, i) => staticHtml`${i ? staticHtml`<${sep}></${sep}>` : nothing}
				<${label}>${g.label}</${label}>
				<div role="group" aria-label=${g.label} class="flex flex-col">
					${g.options.map((o) => staticHtml`<${item} role="menuitemradio" aria-checked=${String(this.value[g.key] === o.value)} keep-open @select=${() => this.pick(g.key, o.value)}>
						<span class="min-w-0 flex-1 truncate text-left">${o.label}</span>
						${icon(Check, 'check', { size: 14, strokeWidth: 1.5, class: this.value[g.key] !== o.value ? 'shrink-0 invisible' : 'shrink-0', attrs: { 'aria-hidden': 'true' } })}
					</${item}>`)}
				</div>`)}
			</div>
		</${menu}>`}`
	}
}

define('filter-menu', FilterMenu)
