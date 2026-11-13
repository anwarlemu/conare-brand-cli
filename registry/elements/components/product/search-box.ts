import { nothing, type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { live } from 'lit/directives/live.js'
import { repeat } from 'lit/directives/repeat.js'
import { ArrowUp, Check, ClipboardType, CornerDownLeft, FileText, Image, Plug, Plus, X } from 'lucide'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import '@/elements/components/ui/dot-matrix'
import '@/elements/components/ui/menu'
import '@/elements/components/ui/menu-item'
import '@/elements/components/ui/menu-label'
import '@/elements/components/ui/menu-separator'
import '@/elements/components/ui/pixel-button'
import styles from 'virtual:tw'

// SearchBox.vue as <conare-search-box>: the search box as Explorer has it (design-system field/Search, console2.css
// .v2-searchbox, .v2-attach), and the library's input group: a field with controls before and after it. The question
// in a 14px textarea; the files attached, each showing adding, then added (or failed); a bar with the plus for more
// data (files, photos and scans, pasted text, an app), the `scope` slot for where it looks, the Enter cue and the red
// arrow, live once there is a question. Enter searches, Shift+Enter breaks the line. Files can be dropped on it. The
// hairline turns ink while anything inside has focus. It calls nothing: it fires `submit`, `files`, `paste`, `connect`
// and `remove`, and the app owns `attached`. v-model is `value` with the textarea's own `input` events.
export interface Attachment { key: string, name: string, state: 'adding' | 'added' | 'failed' }

// The send button's `ml-auto sm:ml-0` (a class on Vue's Button root) has to reach the box <conare-button> draws in its
// own shadow root: the search box marks it (data-searchbox-send) and gives that shadow root this rule once.
const SEND_RULES = `:host([data-searchbox-send]) > [data-ds] { margin-left: auto; } @media (width >= 40rem) { :host([data-searchbox-send]) > [data-ds] { margin-left: 0; } }`
const sendSheets = new WeakSet<ShadowRoot>()

/**
 * @summary The search box: the question, attached files, the add menu, the scope and the send arrow.
 * @slot scope - Where it looks (a <conare-scope-menu>).
 * @fires submit - Search; detail { question }.
 * @fires files - Files to add (picked or dropped); detail { files }.
 * @fires paste - Text to add; detail { text }.
 * @fires connect - Connect an app was chosen.
 * @fires remove - An attached file's cross; detail { key }.
 * @fires input - The question changed (read `value`).
 */
export class SearchBox extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		value: {},
		attached: { type: Array },
		label: {},
		placeholder: {},
		target: {},
		busy: { type: Boolean },
		accept: {},
		addMenu: { attribute: 'add-menu', converter: { fromAttribute: (v: string | null) => v !== 'false' } },
		dragging: { state: true },
		pasting: { state: true },
		pasted: { state: true },
	}

	/** The question. */
	value = ''
	/** [{ key, name, state: adding, added or failed }]. */
	attached: Attachment[] = []
	/** The question's name. */
	label = 'question'
	placeholder = 'Ask a question your documents answer'
	/** Where added data goes, named in the add menu. */
	target = 'uploads'
	/** A search is running: the arrow shows the dot matrix. */
	busy = false
	/** The file types the Files row picks. */
	accept = '.pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.json,.html'
	/** The plus with the add menu; add-menu="false" leaves it out. */
	addMenu = true
	private dragging = false
	private pasting = false
	private pasted = ''
	private uid = uid('searchbox')

	private onDrop(event: DragEvent) {
		event.preventDefault()
		this.dragging = false
		const files = Array.from(event.dataTransfer?.files ?? [])
		if (files.length) this.emit('files', { files })
	}
	private onFiles(event: Event) {
		const input = event.target as HTMLInputElement
		const files = Array.from(input.files ?? [])
		if (files.length) this.emit('files', { files })
		input.value = ''
	}
	private async startPaste() {
		this.pasting = true
		await this.updateComplete
		this.renderRoot.querySelector<HTMLTextAreaElement>(`#${this.uid}-paste`)?.focus()
	}
	private addPasted() {
		this.emit('paste', { text: this.pasted.trim() })
		this.pasted = ''
		this.pasting = false
	}
	private submit(event?: Event) {
		event?.preventDefault()
		if (!this.value.trim() || this.busy) return
		this.emit('submit', { question: this.value.trim() })
	}
	private onKey(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
		event.preventDefault()
		this.submit()
	}

	protected async updated(changed: PropertyValues) {
		super.updated(changed)
		const send = this.renderRoot.querySelector<HTMLElement & { updateComplete?: Promise<unknown> }>('[data-searchbox-send]')
		if (!send) return
		await customElements.whenDefined(send.localName)
		await send.updateComplete
		const root = send.shadowRoot
		if (!root || sendSheets.has(root)) return
		const sheet = new CSSStyleSheet()
		sheet.replaceSync(SEND_RULES)
		root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
		sendSheets.add(root)
	}

	render() {
		const u = this.uid
		const [button, dots, menu, item, menuLabel, separator, pixel] = ['button', 'dot-matrix', 'menu', 'menu-item', 'menu-label', 'menu-separator', 'pixel-button'].map(tag)
		const files = () => this.renderRoot.querySelector<HTMLInputElement>('[data-files]')?.click()
		const photos = () => this.renderRoot.querySelector<HTMLInputElement>('[data-photos]')?.click()
		const glyph = (node: Parameters<typeof icon>[0], name: string) => icon(node, name, { size: 14, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })
		return html`<form data-ds="search-box" class="ds-searchbox w-full" role="search" data-drag=${this.dragging ? 'true' : nothing} @submit=${(e: Event) => this.submit(e)} @dragover=${(e: DragEvent) => { e.preventDefault(); this.dragging = true }} @dragleave=${(e: DragEvent) => { if (e.target === e.currentTarget) this.dragging = false }} @drop=${(e: DragEvent) => this.onDrop(e)}>
			<label class="sr-only" for=${`${u}-q`}>${this.label}</label>
			<textarea id=${`${u}-q`} .value=${live(this.value)} rows="2" placeholder=${this.dragging ? 'Drop files to add them' : this.placeholder} @input=${(e: Event) => { this.value = (e.target as HTMLTextAreaElement).value }} @keydown=${(e: KeyboardEvent) => this.onKey(e)}></textarea>
			${this.pasting
				? html`<div class="mx-3 mt-1 flex flex-col gap-2 border border-edge bg-surface-subtle p-2">
						<label class="sr-only" for=${`${u}-paste`}>text to add</label>
						<textarea id=${`${u}-paste`} .value=${live(this.pasted)} rows="3" class="w-full resize-none bg-transparent type-ui outline-none placeholder:text-fg-muted" placeholder="Paste a note, an email or a policy" @input=${(e: Event) => { e.stopPropagation(); this.pasted = (e.target as HTMLTextAreaElement).value }} @keydown=${(e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); this.pasting = false } }}></textarea>
						<div class="flex justify-end gap-2">
							<${button} variant="ghost" @click=${() => { this.pasting = false }}>Cancel</${button}>
							<${pixel} ?disabled=${!this.pasted.trim()} @click=${() => this.addPasted()}>Add text</${pixel}>
						</div>
					</div>`
				: nothing}
			${this.attached?.length
				? html`<ul class="flex flex-wrap gap-2 px-3 pt-1" aria-label="attached files">${repeat(this.attached, (a) => a.key, (a) => html`<li class="ds-attach" data-state=${a.state}>${a.state === 'adding' ? html`<${dots}></${dots}>` : a.state === 'failed' ? icon(X, 'x', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } }) : icon(Check, 'check', { size: 12, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } })}<span class="max-w-50 truncate">${a.name}</span><span class="sr-only">${a.state}</span><button type="button" class="ds-attach-x" aria-label=${`remove ${a.name} from the list`} @click=${() => this.emit('remove', { key: a.key })}>${icon(X, 'x', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</button></li>`)}</ul>`
				: nothing}
			<div class="ds-searchbox-bar">
				${this.addMenu
					? html`<input data-files type="file" multiple class="sr-only" tabindex="-1" aria-hidden="true" accept=${this.accept} @change=${(e: Event) => this.onFiles(e)}>
						<input data-photos type="file" multiple class="sr-only" tabindex="-1" aria-hidden="true" accept="image/png,image/jpeg,image/webp,image/tiff" @change=${(e: Event) => this.onFiles(e)}>
						<${menu} label="add data" trigger-label="add data" width="244px">
							<button slot="trigger" type="button" class="ds-addbtn">${icon(Plus, 'plus', { size: 14, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</button>
							<${menuLabel}><span>Add to <span class="font-code">${this.target}</span></span></${menuLabel}>
							<${item} @select=${files}>${glyph(FileText, 'file-text')}<span class="flex-1">Files</span><span class="type-meta text-fg-muted">PDF, Word, slides</span></${item}>
							<${item} @select=${photos}>${glyph(Image, 'image')}<span class="flex-1">Photos and scans</span></${item}>
							<${item} @select=${() => void this.startPaste()}>${glyph(ClipboardType, 'clipboard-type')}<span class="flex-1">Paste text</span></${item}>
							<${separator}></${separator}>
							<${item} @select=${() => this.emit('connect')}>${glyph(Plug, 'plug')}<span class="flex-1">Connect an app</span></${item}>
						</${menu}>`
					: nothing}
				<slot name="scope"></slot>
				<span class="ml-auto hidden items-center gap-1 type-meta text-fg-muted sm:flex">${icon(CornerDownLeft, 'corner-down-left', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}to search</span>
				<${button} data-searchbox-send type="submit" variant="primary" icon ?disabled=${!this.value.trim() || this.busy} aria-label=${this.busy ? 'searching' : 'search'}>${this.busy ? html`<${dots} tone="inverse"></${dots}>` : icon(ArrowUp, 'arrow-up', { size: 14, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>
			</div>
		</form>`
	}
}

define('search-box', SearchBox)
