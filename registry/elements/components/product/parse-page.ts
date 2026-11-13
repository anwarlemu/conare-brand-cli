import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { Check, FileUp } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import type { ParseAnswer } from '@/elements/controllers/parse'
import type { ScopeOption } from '@/elements/components/product/scope-menu'
import '@/elements/components/product/parse-reading'
import '@/elements/components/product/scope-menu'
import '@/elements/components/ui/button'
import '@/elements/components/ui/code-pop'
import '@/elements/components/ui/copy-button'
import '@/elements/components/ui/dot-matrix'
import styles from 'virtual:tw'

// ParsePage.vue as <conare-parse-page>: Parse as a page (pages/dashboard/parse.vue): drop any file and see what Conare
// read, region by region. Nothing is stored. A row of files to try and one of your own (a press or a drop; the row takes
// a red dashed edge while a file is dragged over it), the picked one with a 2px red line along its top and the dot
// matrix while it reads. Then the reading (parse-reading, `version` picks the take), and what comes next: into a
// namespace (scope-menu, one must be chosen), the Markdown, or the API call opening in place (code-pop). The app reads
// the file: it answers `change` (read `chosen`) and `file` ({ file }) and passes the `answer`; `add` ({ namespace }).
// Vue's v-model:chosen is `chosen` with a `change` event.
export interface ParseSampleFile { id: string, what: string, line: string, pages: number }
const ic = (node: Parameters<typeof icon>[0], name: string, size: number, stroke: number, cls?: string) => icon(node, name, { size, strokeWidth: stroke, class: cls, attrs: { 'aria-hidden': 'true' } })

/**
 * @summary Parse as a page: files to try or your own, the reading, then what comes next.
 * @fires change - A file to try was picked (read `chosen`).
 * @fires file - A file of your own was picked or dropped ({ file }).
 * @fires add - Add to namespace was pressed ({ namespace }).
 */
export class ParsePage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		samples: { type: Array }, answer: { type: Object }, reading: { type: Boolean }, version: { type: Number },
		namespaces: { type: Array }, curl: {}, own: {}, chosen: {},
		dragging: { state: true }, into: { state: true }, added: { state: true },
	}

	/** The files to try: { id, what, line, pages }. */
	samples: ParseSampleFile[] = []
	/** What was read, or null while the first read runs. */
	answer: ParseAnswer | null = null
	/** A read is running: the picked file shows the dot matrix. */
	reading = false
	/** The reading's take: 1, 2 or 3 (parse-reading's `version`). */
	version: 1 | 2 | 3 = 1
	/** The namespaces to add the reading to: { name, documents, logo }. */
	namespaces: ScopeOption[] = []
	/** The API call, opening in place. */
	curl = ''
	/** The name of the file of your own, so the page can say its reading is the sample's. */
	own = ''
	/** The picked file to try (Vue's v-model:chosen). */
	chosen = ''
	private dragging = false
	private into = ''
	private added = false

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		// The first namespace is the pick until one is chosen (Vue's ref of the first, at setup).
		if (changed.has('namespaces') && !this.into) this.into = this.namespaces[0]?.name ?? ''
		if (changed.has('answer') && (changed.get('answer') as ParseAnswer | null | undefined)?.id !== this.answer?.id) this.added = false
	}

	private pick(id: string) {
		this.chosen = id
		this.emit('change')
	}
	private take(files: FileList | null | undefined) {
		const f = files?.[0]
		if (f) this.emit('file', { file: f })
	}
	private drop(event: DragEvent) {
		event.preventDefault()
		this.dragging = false
		this.take(event.dataTransfer?.files)
	}
	private add() {
		this.added = true
		this.emit('add', { namespace: this.into })
	}

	render() {
		const a = this.answer
		const b = tag('button')
		return html`<div data-ds="parse-page" class="ds-parsefiles grid grid-cols-4 gap-2 max-lg:grid-cols-2" data-drag=${this.dragging ? 'true' : nothing} @dragover=${(e: DragEvent) => { e.preventDefault(); this.dragging = true }} @dragleave=${(e: DragEvent) => { e.preventDefault(); this.dragging = false }} @drop=${this.drop}>${this.samples.map((s) => html`<button type="button" class="ds-parsefile" aria-pressed=${String(this.chosen === s.id)} @click=${() => this.pick(s.id)}><span class="min-w-0"><span class="block truncate type-ui-strong">${s.what}</span><span class="block truncate type-meta text-fg-muted">${`${s.line}, ${s.pages} ${s.pages === 1 ? 'page' : 'pages'}`}</span></span>${this.chosen === s.id && this.reading ? staticHtml`<${tag('dot-matrix')}></${tag('dot-matrix')}>` : this.chosen === s.id ? ic(Check, 'check', 14, 1.5, 'shrink-0 max-sm:hidden') : nothing}</button>`)}<button type="button" class="ds-parsefile" @click=${() => this.renderRoot.querySelector<HTMLInputElement>('input[type=file]')?.click()}><span class="min-w-0"><span class="block truncate type-ui-strong">Your file</span><span class="block truncate type-meta text-fg-muted">Drop it here</span></span>${ic(FileUp, 'file-up', 14, 1.5, 'shrink-0 max-sm:hidden')}</button><input type="file" class="sr-only" tabindex="-1" aria-label="choose a file to parse" @change=${(e: Event) => this.take((e.target as HTMLInputElement).files)}></div>${!a
			? html`<p data-ds="parse-page" class="type-meta text-fg-muted">Reading.</p>`
			: html`${repeat([a.id + a.name], (k) => k, () => staticHtml`<${tag('parse-reading')} .rootName=${'parse-page'} .answer=${a} .version=${this.version}></${tag('parse-reading')}>`)}<div data-ds="parse-page" class="flex flex-wrap items-center gap-2">${this.added
				? html`<p class="inline-flex items-center gap-1.5 type-meta" role="status">${ic(Check, 'check', 12, 2)}Added to <span class="font-code">${this.into}</span></p>`
				: this.namespaces.length
					? html`${staticHtml`<${tag('scope-menu')} .value=${this.into} .namespaces=${this.namespaces} single @change=${(e: Event) => { e.stopPropagation(); this.into = String((e.currentTarget as HTMLElement & { value: string }).value) }} @input=${(e: Event) => e.stopPropagation()}></${tag('scope-menu')}>`}${staticHtml`<${b} press ?disabled=${!this.into} @click=${() => this.add()}>Add to namespace</${b}>`}`
					: nothing}<span class="ml-auto inline-flex">${staticHtml`<${tag('copy-button')} .text=${a.markdown} label="Copy Markdown"></${tag('copy-button')}>`}</span>${this.curl ? staticHtml`<${tag('code-pop')} .code=${this.curl} label="API call" heading="Parse this file from your code"></${tag('code-pop')}>` : nothing}</div>${this.own && a.name === this.own ? html`<p data-ds="parse-page" class="type-meta text-fg-muted">This shows a sample reading, not your file.</p>` : nothing}`}`
	}
}

define('parse-page', ParsePage)
