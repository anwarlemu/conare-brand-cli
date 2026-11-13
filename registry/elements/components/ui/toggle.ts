import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Toggle.vue as <conare-toggle>: a pressable chip that stays on (console2.css .v2-chip.v2-chip-pick with aria-pressed):
// 28px, a hairline, 12px, and a 4px red square at its start that shows on hover and stays while it is on, when the edge
// also turns ink. A press gives the paper fill. For one setting that is on or off in a row of filters or options; a few
// that exclude each other are a <conare-toggle-group>. 40px on phones. Vue's v-model is `pressed` (an attribute) with
// `pressed-change`.

/**
 * @summary A pressable chip that stays on.
 * @slot - The label, with a Lucide icon before it if any.
 * @fires pressed-change - It was pressed; detail.value is the new state.
 */
export class Toggle extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { pressed: { type: Boolean, reflect: true }, disabled: { type: Boolean, reflect: true } }

	pressed = false
	disabled = false

	render() {
		return html`<button data-ds="toggle" type="button" class="ds-toggle" aria-pressed=${String(this.pressed)} ?disabled=${this.disabled} @click=${() => this.commit(!this.pressed, 'pressed')}><slot></slot></button>`
	}
}

define('toggle', Toggle)
