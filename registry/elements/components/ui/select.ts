import { html, type TemplateResult } from 'lit'
import { ChevronDown } from 'lucide'
import { define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Combobox, type ComboOption } from '@/elements/components/ui/combobox'
import styles from 'virtual:tw'

// Select.vue as <conare-select>: pick one of a few options in a form: the 32px field (a #C3C1BF hairline that turns ink
// on focus and while open) with a 12px chevron that turns over as it opens, and a listbox on Menu's square panel at
// least as wide as the field, the pick checked. No filter: typing jumps to the option it starts. Arrows, Home, End,
// Enter, Escape (<conare-combobox>, which it extends). v-model is `value` with `input` and `change`. Form-associated.

/**
 * @summary Pick one of a few options in a form.
 * @fires input - The pick changed (read `value`).
 * @fires change - The pick changed (read `value`).
 */
export class Select extends Combobox {
	static styles = [Combobox.styles, styles]

	constructor() {
		super()
		this.filter = false
		this.matchWidth = true
	}
	protected renderTrigger(selected: ComboOption | undefined): TemplateResult {
		return html`<span class=${selected ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate text-fg-muted'}>${selected?.label ?? this.placeholder}</span>${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted transition-[rotate] duration-120 ease-out group-aria-expanded:rotate-180 group-aria-expanded:duration-180 motion-reduce:transition-none', attrs: { 'aria-hidden': 'true' } })}`
	}
}

define('select', Select)
