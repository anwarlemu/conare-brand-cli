import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ToggleGroup.vue as <conare-toggle-group>: buttons that stay pressed, on the segmented control's track (console2.css
// .v2-tabs with aria-pressed): a paper track in a hairline, each pressed one a white block with its own hairline.
// `multiple` lets several stay on (the value is an array); otherwise one at most, pressing it again lets it go, and
// where the browser has anchor positioning the white block glides to the pick in 180ms. For views of one thing use
// Tabs; this is for options that are on or off. `options` is a JSON attribute or a property; v-model is `value` (a
// string, a JSON array with `multiple`, or null) with `input` and `change`.

export type ToggleGroupOption = string | { value: string, label: string, disabled?: boolean }
export type ToggleGroupValue = string | string[] | null

const norm = (o: ToggleGroupOption) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })
// value="Recent first" or value='["Pages","Files"]'.
const fromAttribute = (v: string | null): ToggleGroupValue => (v === null ? null : v.trim().startsWith('[') ? JSON.parse(v) as string[] : v)

/**
 * @summary Buttons that stay pressed, on a track.
 * @fires input - A button was pressed (read `value`).
 * @fires change - A button was pressed (read `value`).
 */
export class ToggleGroup extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { options: { type: Array }, label: {}, multiple: { type: Boolean }, value: { converter: { fromAttribute } } }

	options: ToggleGroupOption[] = []
	/** The group's name for assistive tech. */
	label = ''
	multiple = false
	value: ToggleGroupValue = null

	private on(v: string) {
		return Array.isArray(this.value) ? this.value.includes(v) : this.value === v
	}
	private press(v: string) {
		if (this.multiple) {
			const list = Array.isArray(this.value) ? this.value : []
			this.commit(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
		} else this.commit(this.value === v ? null : v)
	}

	render() {
		return html`<div data-ds="toggle-group" class="ds-toggles" role="group" aria-label=${this.label} data-multiple=${ifDefined(this.multiple ? 'true' : undefined)}>${this.options.map(norm).map((o) => html`<button type="button" aria-pressed=${String(this.on(o.value))} ?disabled=${o.disabled} @click=${() => this.press(o.value)}>${o.label}</button>`)}</div>`
	}
}

define('toggle-group', ToggleGroup)
