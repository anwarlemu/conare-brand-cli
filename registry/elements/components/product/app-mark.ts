import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// AppMark.vue as <conare-app-mark>: an app's mark beside its name: the app's own logo when `logo` is given, otherwise
// a square tile in a hairline with the name's initial, never a round one. `size` in px (16 in rows, 20 in tiles).

/** @summary An app's logo, or a square tile with its initial. */
export class AppMark extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { name: {}, logo: {}, size: { type: Number } }

	/** The app's name (its initial when there is no logo). */
	name = ''
	/** The app's logo. */
	logo?: string | null
	/** In px. */
	size = 16

	render() {
		const box = `width: ${this.size}px; height: ${this.size}px`
		return this.logo
			? html`<img data-ds="app-mark" src=${this.logo} alt="" width=${this.size} height=${this.size} class="shrink-0 object-contain" style=${box} loading="lazy" decoding="async">`
			: html`<span data-ds="app-mark" class="inline-flex shrink-0 items-center justify-center border border-edge bg-surface-subtle text-tag leading-none font-medium text-fg-soft" style=${box} aria-hidden="true">${(this.name ?? '').charAt(0).toUpperCase()}</span>`
	}
}

define('app-mark', AppMark)
