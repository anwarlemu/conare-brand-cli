import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Check, Download, X } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { DownloadStateController, download, type DownloadState } from '@/elements/controllers/document-download'
import '@/elements/components/ui/dot-matrix'
import styles from 'virtual:tw'

// DownloadMark.vue as <conare-download-mark>: a document's download at the end of its row (the console's
// namespaces/DownloadMark.vue, .v2-docdl): a 14px mark, muted at rest and ink under the pointer, with a 30px target.
// Pressed, it says what happened: the dot matrix while it works (only after 150ms, so a quick file shows no flash of
// it), then a check, or a red cross if it failed. The marks cross-fade and settle from 0.8 scale. `state` overrides
// the shared state (controllers/document-download.ts). `download(get, name?)` downloads this document (the module's
// download(id, ...), for a page script with no imports).

/**
 * @summary A document's download mark at the end of its row.
 * @fires press - It was pressed (call download(get, name) from here).
 */
export class DownloadMark extends DsElement {
	static styles = [DsElement.styles, styles]
	// `id` is HTML's own attribute; the document's id is `doc` (the attribute doc-id).
	static properties = { doc: { attribute: 'doc-id' }, state: {} }

	/** The document's id (Vue's `id`). */
	doc = ''
	/** Overrides the shared state: busy, done or failed. */
	state?: DownloadState
	private shared = new DownloadStateController(this)

	/** Downloads this document: saves what `get` returns as `name`. */
	download(get: () => Promise<Blob | string> | Blob | string, name?: string) {
		return download(this.doc, get, name)
	}

	render() {
		const now = this.state ?? this.shared.state(this.doc)
		const dots = tag('dot-matrix')
		return html`<button data-ds="download-mark" type="button" class="ds-docdl" data-state=${ifDefined(now)} aria-label=${`download ${this.doc}`} @click=${(e: Event) => { e.stopPropagation(); this.emit('press') }}>
			${icon(Download, 'download', { size: 14, strokeWidth: 1.5, attrs: { 'data-for': 'idle' } })}
			<span data-for="busy" class="inline-grid place-items-center">${staticHtml`<${dots}></${dots}>`}</span>
			${icon(Check, 'check', { size: 14, strokeWidth: 2, attrs: { 'data-for': 'done' } })}
			${icon(X, 'x', { size: 14, strokeWidth: 2, attrs: { 'data-for': 'failed' } })}
		</button><span data-ds="download-mark" class="sr-only" aria-live="polite">${now === 'done' ? `${this.doc} downloaded` : now === 'failed' ? `${this.doc} failed to download` : ''}</span>`
	}
}

define('download-mark', DownloadMark)
