import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Check } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { DownloadStateController, download } from '@/elements/controllers/document-download'
import '@/elements/components/ui/pixel-button'
import styles from 'virtual:tw'

// DownloadButton.vue as <conare-download-button>: the dark button for a document, under an opened document or a result
// (the console's DownloadButton.vue): red pixels come in on hover, and it says Downloaded once it has, since the
// browser's own bar can sit out of sight. The words cross in one cell (.v2-swap): Download leaves up, Downloaded comes
// up with its check drawing, so the width holds. Its state is the document's (controllers/document-download.ts), unless
// `done` says. `download(get, name?)` downloads this document, for a page script with no imports.

/**
 * @summary The dark button for a document, saying Downloaded once it has.
 * @fires press - It was pressed (call download(get, name) from here).
 */
export class DownloadButton extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { doc: { attribute: 'doc-id' }, label: {}, done: { type: Boolean } }

	/** The document's id (Vue's `id`; `id` is HTML's own attribute). */
	doc = ''
	/** The word at rest (Download). */
	label?: string
	/** Overrides the shared state. Vue casts a boolean prop left out to false, not undefined, so DownloadButton.vue's
	 * `done ?? shared` never reads the shared state; it defaults to false here too, so the flavors agree. */
	done = false
	private shared = new DownloadStateController(this)

	/** Downloads this document: saves what `get` returns as `name`. */
	download(get: () => Promise<Blob | string> | Blob | string, name?: string) {
		return download(this.doc, get, name)
	}

	// Vue's fallthrough data-ds="download-button" lands on PixelButton's root, which here sits in the pixel button's own
	// shadow root: it is named there once rendered (Lit leaves an attribute it wrote once alone afterwards).
	protected async firstUpdated(changed: Map<PropertyKey, unknown>) {
		super.firstUpdated(changed)
		const pixel = this.renderRoot.firstElementChild as (HTMLElement & { updateComplete?: Promise<unknown> }) | null
		if (!pixel) return
		await customElements.whenDefined(pixel.localName)
		await pixel.updateComplete
		pixel.shadowRoot?.querySelector('[data-ds="pixel-button"]')?.setAttribute('data-ds', 'download-button')
	}

	render() {
		const isDone = this.done ?? this.shared.state(this.doc) === 'done'
		const pixel = tag('pixel-button')
		return staticHtml`<${pixel} ?done=${isDone} @click=${() => this.emit('press')}><span class="ds-dlswap" data-on=${ifDefined(isDone ? 'true' : undefined)}><span class="ds-dlswap-a">${this.label ?? 'Download'}</span><span class="ds-dlswap-b" aria-hidden="true">${icon(Check, 'check', { size: 12, strokeWidth: 2 })}Downloaded</span></span>${html`<span class="sr-only" aria-live="polite">${isDone ? 'downloaded' : ''}</span>`}</${pixel}>`
	}
}

define('download-button', DownloadButton)
