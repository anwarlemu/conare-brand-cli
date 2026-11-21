import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { Check, ChevronDown } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/menu'
import '@/elements/components/ui/menu-item'
import styles from 'virtual:tw'

// FilterChip.vue as <conare-filter-chip>: one filter as a menu button under the search box (search/FilterChip.vue,
// console2.css .v2-scope): "App", or "App: Slack" once chosen, with an ink edge while something is chosen or the menu
// is open. The menu is a radio list on a menu's panel, "Any" first (the empty value: '' or 0), a check on the pick.
// 28px, 40px on phones. v-model is `value` with `input` and `change` events; `options` is a JSON attribute or the
// property.
export type FilterValue = string | number

/**
 * @summary One filter as a menu button.
 * @fires input - The pick changed (read `value`).
 * @fires change - The pick changed (read `value`).
 */
export class FilterChip extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, any: {}, options: { type: Array }, width: {}, value: {} }

	/** The filter's name: App, Type. */
	label = ''
	/** The empty choice's label: Any app. */
	any = ''
	options: Array<{ value: FilterValue, label: string }> = []
	width = '200px'
	/** The pick ('' or 0 for any). */
	value: FilterValue = ''

	private get empty(): FilterValue {
		return typeof this.options[0]?.value === 'number' ? 0 : ''
	}
	private is(a: FilterValue, b: FilterValue) {
		return String(a) === String(b)
	}

	render() {
		const menu = tag('menu')
		const item = tag('menu-item')
		const all = [{ value: this.empty, label: this.any }, ...this.options]
		const chosen = this.options.find((o) => this.is(o.value, this.value))?.label ?? ''
		const trigger = [
			'inline-flex h-control-sm cursor-pointer items-center gap-1.5 border px-2 text-meta text-fg whitespace-nowrap transition-[border-color,background-color] duration-120 ease-standard',
			'hover:border-edge-focus active:bg-surface-subtle aria-expanded:border-edge-focus aria-expanded:bg-surface focus-visible:outline-offset-1',
			'max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui',
			chosen ? 'border-edge-focus bg-surface' : 'border-edge bg-surface-subtle',
		].join(' ')
		return html`${staticHtml`<${menu} data-ds="filter-chip" label=${this.label} width=${this.width}>
			<button slot="trigger" type="button" class=${trigger}>${this.label}${chosen ? html`: <span class="font-medium">${chosen}</span>` : nothing}${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'text-fg-muted transition-[rotate] duration-120 ease-out motion-reduce:transition-none', attrs: { 'aria-hidden': 'true' } })}</button>
			<div class="fade-y flex max-h-75 flex-col overflow-y-auto">
				${all.map((o) => staticHtml`<${item} role="menuitemradio" aria-checked=${String(this.is(this.value, o.value))} @select=${() => this.commit(o.value)}>
					<span class="min-w-0 flex-1 truncate">${o.label}</span>
					${icon(Check, 'check', { size: 14, strokeWidth: 1.5, class: this.is(this.value, o.value) ? 'shrink-0' : 'shrink-0 invisible', attrs: { 'aria-hidden': 'true' } })}
				</${item}>`)}
			</div>
		</${menu}>`}`
	}
}

define('filter-chip', FilterChip)
