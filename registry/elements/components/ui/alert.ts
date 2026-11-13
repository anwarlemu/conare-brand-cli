import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Alert.vue as <conare-alert>: a red box for what broke (console2.css .v2-banner-row): one box per problem, the problem
// in words (its subject in ink, medium) and the button that fixes it. A 6px red square leads it. Stack several in a
// column 8px apart, one each. Vue's `title` is `heading` (title is HTML's tooltip attribute).

/**
 * @summary A red box for what broke, with the button that fixes it.
 * @slot - What went wrong, after the subject.
 * @slot action - The button that fixes it.
 */
export class Alert extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {} }

	/** The problem's subject, in ink (Vue's `title`). */
	heading = ''

	render() {
		return html`<div data-ds="alert" class="flex flex-wrap items-center gap-x-3 gap-y-2.5 border border-home-red-press bg-surface-danger py-2.5 pr-3 pl-4 text-fg-danger max-md:items-start max-md:p-3" role="alert">
			<span class="size-1.5 shrink-0 bg-home-red-press max-md:mt-1.75" aria-hidden="true"></span>
			<p class="min-w-0 flex-1 max-md:basis-[calc(100%-48px)]"><span class="font-medium text-fg">${this.heading}</span> <slot></slot></p>
			${this.hasSlot('action') ? html`<div class="shrink-0"><slot name="action"></slot></div>` : nothing}
		</div>`
	}
}

define('alert', Alert)
