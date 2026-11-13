import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// RollText.vue as <conare-roll-text>: a label that rolls up to a copy of itself (console2.css and home.css .roll): the
// label sits in a clipped box with a copy parked just below; hovering or keyboard focus on the nearest `.ds-roll-host`
// slides the label up and out as the copy slides in, in 160ms on the console's curve. `pace="site"` moves one line
// (the website's footer), the console's moves 110% so no sliver shows. Only where a pointer can rest: a tap would leave
// it rolled. Reduced motion holds it still.
//
// The host is the clipped box (roll-text.css), so a class on it lands as one on <RollText> does. A page's
// `.ds-roll-host:hover` cannot reach into the shadow root, so the element watches its nearest `.ds-roll-host` (the
// pointer resting on it, keyboard focus in it) and marks the two labels, which roll by the same rules.

/**
 * @summary A label that rolls up to a copy of itself on hover or keyboard focus.
 */
export class RollText extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { text: {}, pace: { reflect: true }, hovered: { state: true }, focused: { state: true } }

	text = ''
	/** `site` moves one line, the console's 110%. */
	pace: 'console' | 'site' = 'console'
	private hovered = false
	private focused = false
	private rollHost: Element | null = null

	private onEnter = () => { this.hovered = true }
	private onLeave = () => { this.hovered = false }
	private onFocus = () => { this.focused = !!this.rollHost?.matches(':focus-visible') }
	private onBlur = () => { this.focused = false }

	connectedCallback() {
		super.connectedCallback()
		if (!this.hasAttribute('pace')) this.setAttribute('pace', this.pace)
		const host = this.closest('.ds-roll-host')
		this.rollHost = host
		if (!host) return
		host.addEventListener('pointerenter', this.onEnter)
		host.addEventListener('pointerleave', this.onLeave)
		host.addEventListener('focus', this.onFocus)
		host.addEventListener('blur', this.onBlur)
		this.hovered = host.matches(':hover')
		this.focused = host.matches(':focus-visible')
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		const host = this.rollHost
		if (!host) return
		host.removeEventListener('pointerenter', this.onEnter)
		host.removeEventListener('pointerleave', this.onLeave)
		host.removeEventListener('focus', this.onFocus)
		host.removeEventListener('blur', this.onBlur)
		this.rollHost = null
	}

	render() {
		return html`<span class="ds-roll-a" ?data-hover=${this.hovered} ?data-focus=${this.focused}>${this.text}</span><span class="ds-roll-b" aria-hidden="true" ?data-hover=${this.hovered} ?data-focus=${this.focused}>${this.text}</span>`
	}
}

define('roll-text', RollText)
