import { html, type PropertyValues } from 'lit'
import { ChevronDown } from 'lucide'
import { DsElement, define, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Collapsible.vue as <conare-collapsible>: a part that opens in place and pushes what follows (console2.css
// .v2-collapse, CodePop's open-in-place): the row grows to its content's height (0fr to 1fr) over 260ms on the strong
// ease-out and closes in 180ms; the content fades up 6px from a 2px blur, a beat after the row starts. The chevron
// turns 180 degrees (180ms, 120ms back). Toggled from the keyboard it opens at once. The trigger: content in the
// `trigger` slot, drawn as a quiet row with the chevron, or a <button slot="trigger"> you style yourself (Vue's
// triggerClass; draw your own chevron in it). Vue's v-model:open is the `open` attribute with `open-change`.

/**
 * @summary A part that opens in place and pushes what follows.
 * @slot - What opens.
 * @slot trigger - The trigger's content, or a <button> to use as the trigger.
 * @fires open-change - It opened or closed (detail.value).
 */
export class Collapsible extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { open: { type: Boolean, reflect: true }, instant: { state: true } }

	open = false
	private instant = false
	private regionId = uid('collapse')

	private toggle = (event: MouseEvent) => {
		this.instant = event.detail === 0
		this.commit(!this.open, 'open')
	}

	// The page's own trigger button gets the button's attributes and the press.
	private wired: HTMLElement | null = null
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		const own = this.querySelector<HTMLElement>(':scope > button[slot="trigger"]')
		if (own !== this.wired) {
			this.wired?.removeEventListener('click', this.toggle)
			own?.addEventListener('click', this.toggle)
			this.wired = own
		}
		own?.setAttribute('aria-expanded', String(this.open))
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.wired?.removeEventListener('click', this.toggle)
		this.wired = null
	}

	render() {
		const own = !!this.querySelector(':scope > button[slot="trigger"]')
		const trigger = own
			? html`<slot name="trigger"></slot>`
			: html`<button type="button" class="flex w-full cursor-pointer items-center gap-2 py-2 text-left type-ui text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus max-md:min-h-11" aria-expanded=${String(this.open)} aria-controls=${this.regionId} @click=${this.toggle}><slot name="trigger"></slot>${icon(ChevronDown, 'chevron-down', { size: 14, strokeWidth: 1.5, class: 'ds-collapsible-chev ml-auto shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</button>`
		return html`<div data-ds="collapsible" class="ds-collapsible" ?data-open=${this.open} ?data-instant=${this.instant}>
			${trigger}
			<div id=${this.regionId} class="ds-collapsible-region" ?inert=${!this.open}>
				<div><div class="ds-collapsible-content"><slot></slot></div></div>
			</div>
		</div>`
	}
}

define('collapsible', Collapsible)
