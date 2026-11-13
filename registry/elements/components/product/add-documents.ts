import { nothing, type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { live } from 'lit/directives/live.js'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/ui/field'
import '@/elements/components/ui/input'
import '@/elements/components/ui/tabs'
import styles from 'virtual:tw'

// AddDocuments.vue as <conare-add-documents>: write first documents from the console: upload files or paste text (the
// console's AddDocuments.vue). A text file is one document (its id from its name); a PDF, Word document, PowerPoint deck
// or Excel workbook becomes one document whose hits cite their page, slide or sheet. It checks the namespace's name and
// the files' types, then fires `upload` or `paste`; the app writes them and sets `writing`, then `notice` or `error`.
// `connect` is the way to an app. v-model:namespace is `namespace` with `namespace-change`.
export interface PastedDocument { id: string, text: string }

const NAMESPACE = /^[a-z0-9][a-z0-9_-]{0,63}$/
const TEXT = /\.(txt|md|markdown|mdx|csv|tsv|json|jsonl|ndjson|html?|xml|ya?ml|log|rst|tex)$/i
const FILE = /\.(pdf|xlsx|docx|docm|dotx|pptx|pptm|potx|ppsx)$/i
const ACCEPT = '.txt,.md,.markdown,.mdx,.csv,.tsv,.json,.jsonl,.ndjson,.html,.htm,.xml,.yaml,.yml,.log,.rst,.tex,text/*,.pdf,application/pdf,.xlsx,.docx,.docm,.dotx,.pptx,.pptm,.potx,.ppsx'
const MODES = [{ value: 'upload', label: 'Upload files' }, { value: 'paste', label: 'Paste text' }]

// An API document id: a letter or digit first, then A-Z a-z 0-9 . _ : - (240 at most, room for a "-N").
function docId(name: string) {
	return name.replace(/[^A-Za-z0-9._:-]+/g, '-').replace(/^[^A-Za-z0-9]+/, '').replace(/-+$/, '').slice(0, 240) || 'document'
}

/**
 * @summary Upload files or paste text into a namespace.
 * @fires upload - Files to write; detail { namespace, files }.
 * @fires paste - Text to write; detail { namespace, doc: { id, text } }.
 * @fires connect - The way to an app was chosen.
 * @fires browse - Browse after a write; detail { namespace }.
 * @fires namespace-change - The namespace was edited; detail { value }.
 */
export class AddDocuments extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		writing: { type: Boolean },
		notice: {},
		error: {},
		namespace: {},
		mode: { state: true },
		files: { state: true },
		pasteId: { state: true },
		pasteText: { state: true },
		rejected: { state: true },
		dragging: { state: true },
	}

	/** The app is writing: the buttons wait. */
	writing = false
	/** What landed, with Browse after it; a new notice clears the form. */
	notice = ''
	/** The app's error. */
	error = ''
	/** Where the documents go. */
	namespace = 'uploads'
	private mode: 'upload' | 'paste' = 'upload'
	private files: File[] = []
	private pasteId = ''
	private pasteText = ''
	private rejected = ''
	private dragging = false
	private textId = uid('adddocs-text')

	private get valid() {
		return NAMESPACE.test(this.namespace)
	}

	private choose(picked: File[]) {
		this.rejected = ''
		const bad = picked.filter((f) => !FILE.test(f.name) && !TEXT.test(f.name) && !f.type.startsWith('text/'))
		this.files = picked.filter((f) => !bad.includes(f))
		if (bad.length) this.rejected = `${bad.map((f) => f.name).join(', ')}: not a file this can read. Upload text (.txt, .md, .csv, .json, .html), PDF, Word (.docx), PowerPoint (.pptx) or Excel (.xlsx).`
	}
	private drop(event: DragEvent) {
		event.preventDefault()
		this.dragging = false
		this.choose(Array.from(event.dataTransfer?.files ?? []))
	}
	private upload(event: Event) {
		event.preventDefault()
		if (this.files.length && this.valid) this.emit('upload', { namespace: this.namespace, files: this.files })
	}
	private paste(event: Event) {
		event.preventDefault()
		if (!this.pasteText.trim() || !this.valid) return
		const id = docId(this.pasteId.trim() || `note-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`)
		this.emit('paste', { namespace: this.namespace, doc: { id, text: this.pasteText } })
	}

	// Written: the form clears for the next ones.
	protected willUpdate(changed: PropertyValues) {
		if (changed.has('notice') && this.notice) {
			this.files = []
			this.pasteText = ''
			this.pasteId = ''
		}
	}

	render() {
		const button = tag('button')
		const field = tag('field')
		const input = tag('input')
		const tabs = tag('tabs')
		const valid = this.valid
		const shownError = this.rejected || this.error
		const n = this.files.length
		return html`<div data-ds="add-documents" class="flex flex-col gap-3 text-ui">
			<div class="flex flex-wrap items-center gap-3">
				<${tabs} .value=${this.mode} .options=${MODES} label="how to add documents" @change=${(e: Event) => { this.mode = (e.target as HTMLInputElement).value as 'upload' | 'paste' }}></${tabs}>
				<span class="type-meta text-fg-muted">or <button type="button" class="ds-adddocs-link" @click=${() => this.emit('connect')}>connect an app</button></span>
			</div>

			<div class="max-w-xs">
				<${field} label="Namespace" .error=${valid ? undefined : 'Use a-z, 0-9, _ and -, up to 64 characters.'}>
					<${input} .value=${live(this.namespace)} class="font-code" ?invalid=${!valid} required autocomplete="off" @input=${(e: Event) => this.commit((e.target as HTMLInputElement).value, 'namespace')}></${input}>
				</${field}>
			</div>

			${this.mode === 'upload'
				? html`<form class="flex flex-col gap-3" @submit=${(e: Event) => this.upload(e)}>
						<label class="ds-adddocs-drop" data-drag=${this.dragging ? 'true' : nothing} @dragover=${(e: DragEvent) => { e.preventDefault(); this.dragging = true }} @dragleave=${() => { this.dragging = false }} @drop=${(e: DragEvent) => this.drop(e)}>
							<span class="font-medium">${n ? `${n} ${n === 1 ? 'file' : 'files'} selected` : 'Choose or drop files'}</span>
							<span class="text-fg-muted">${n ? this.files.map((f) => f.name).join(', ') : '.txt, .md, .csv, .json, .html, .pdf, .docx, .pptx, .xlsx. Each file is one document.'}</span>
							<input type="file" multiple class="sr-only" aria-label="choose files" accept=${ACCEPT} @change=${(e: Event) => this.choose(Array.from((e.target as HTMLInputElement).files ?? []))}>
						</label>
						<div><${button} type="submit" ?disabled=${this.writing || !n || !valid}>${this.writing ? 'Writing' : 'Add documents'}</${button}></div>
					</form>`
				: html`<form class="flex flex-col gap-3" @submit=${(e: Event) => this.paste(e)}>
						<div class="max-w-md">
							<${field} label="Id (optional)">
								<${input} .value=${live(this.pasteId)} class="font-code" placeholder="refund-policy" maxlength="240" autocomplete="off" @input=${(e: Event) => { this.pasteId = (e.target as HTMLInputElement).value }}></${input}>
							</${field}>
						</div>
						<div class="flex flex-col gap-1.5">
							<label for=${this.textId} class="type-meta text-fg-soft">Text</label>
							<textarea id=${this.textId} .value=${live(this.pasteText)} class="ds-adddocs-text" rows="6" placeholder="Refunds are available for 30 days after purchase." required @input=${(e: Event) => { this.pasteText = (e.target as HTMLTextAreaElement).value }}></textarea>
						</div>
						<div><${button} type="submit" ?disabled=${this.writing || !this.pasteText.trim() || !valid}>${this.writing ? 'Writing' : 'Add document'}</${button}></div>
					</form>`}

			${this.notice ? html`<p role="status">${this.notice} <button type="button" class="ds-adddocs-link" @click=${() => this.emit('browse', { namespace: this.namespace })}>Browse</button></p>` : nothing}
			${shownError ? html`<p class="bg-surface-danger px-3 py-2 text-fg" role="alert">${shownError}</p>` : nothing}
		</div>`
	}
}

define('add-documents', AddDocuments)
