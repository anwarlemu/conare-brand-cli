import { nothing } from 'lit'
import { html } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Check, Copy, X } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { CopyController } from '@/elements/controllers/copy'
import '@/elements/components/product/app-mark'
import '@/elements/components/ui/button'
import '@/elements/components/ui/code-pop'
import '@/elements/components/ui/dot-matrix'
import '@/elements/components/ui/pixel-button'
import styles from 'virtual:tw'

// AddData.vue as <conare-add-data>: the ways data comes in, the fewest clicks first, nothing to name first (the
// console's namespaces/NewData.vue, take 1 with API first, the picks): Send by API leads with one prompt for a coding
// agent and the request a click away; then the likeliest eight apps, each tile's Connect in its corner under the
// pointer (always there on touch); then one quiet line for files, and the whole panel takes a drop. It fires what was
// picked; the app connects, uploads and watches for the first write, setting `connecting`, `uploading`, `waiting` and
// `landed`.
export interface App { type: string, name: string, logo?: string | null }

// Vue's classes on PixelButton's root (each tile's Connect, ds-apptile-go, and Open's ml-auto) have to reach the box
// <conare-pixel-button> draws in its own shadow root: the panel marks the element (data-go, data-go-hover,
// data-go-on, data-push) and gives that shadow root these rules once, the tile's own states set on it from here. A
// tile's mark takes `.ds-apptile > span` on phones (min-width: 0) the same way (data-tile-mark).
const GO_RULES = `
:host([data-go]) > [data-ds] { position: absolute; right: 10px; bottom: 10px; opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { :host([data-go][data-go-hover]) > [data-ds] { opacity: 1; } }
@media (hover: none) { :host([data-go]) > [data-ds] { position: static; opacity: 1; } }
:host([data-go][data-go-on]) > [data-ds] { opacity: 1; }
@media (max-width: 767px) { :host([data-go]) > [data-ds] { position: static; margin-left: auto; opacity: 1; } }
:host([data-push]) > [data-ds] { margin-left: auto; }
@media (max-width: 767px) { :host([data-tile-mark]) > span { min-width: 0; } }
`
const goSheets = new WeakSet<ShadowRoot>()

/**
 * @summary The ways data comes in: a prompt for an agent, eight apps, and a drop for files.
 * @fires connect - An app was picked; detail { app }.
 * @fires files - Files were dropped or chosen; detail { files }.
 * @fires copied - The prompt is on the clipboard.
 * @fires open - Open the namespace the first write landed in; detail { namespace }.
 * @fires close - The close button.
 */
export class AddData extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { apps: { type: Array }, prompt: {}, code: {}, namespace: {}, connecting: {}, uploading: { type: Number }, waiting: { type: Boolean }, landed: { type: Boolean }, error: {}, closable: { type: Boolean }, dragging: { state: true } }

	/** [{ type, name, logo? }]; the first eight show. */
	apps: App[] = []
	/** The prompt that sends the documents. */
	prompt = ''
	/** The request it makes. */
	code = ''
	/** Where the first API write lands. */
	namespace = ''
	/** The app being connected (its type). */
	connecting?: string
	/** How many files are uploading. */
	uploading?: number
	/** Waiting for the first API write. */
	waiting = false
	/** The first write landed. */
	landed = false
	error?: string
	/** A close button beside it. */
	closable = false
	private dragging = 0
	private copier = new CopyController(this)

	private async copyPrompt() {
		if (await this.copier.copy(this.prompt)) this.emit('copied')
	}
	private dropped(event: DragEvent) {
		event.preventDefault()
		this.dragging = 0
		const files = Array.from(event.dataTransfer?.files ?? [])
		if (files.length) this.emit('files', { files })
	}
	private picked(event: Event) {
		const input = event.target as HTMLInputElement
		const files = Array.from(input.files ?? [])
		if (files.length) this.emit('files', { files })
		input.value = ''
	}

	// The marked pixel buttons get their rules once they have drawn their shadow roots.
	protected async updated() {
		const marked = [...this.renderRoot.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('[data-go], [data-push], [data-tile-mark]')]
		for (const el of marked) {
			await customElements.whenDefined(el.localName)
			await el.updateComplete
			const root = el.shadowRoot
			if (!root || goSheets.has(root)) continue
			const sheet = new CSSStyleSheet()
			sheet.replaceSync(GO_RULES)
			root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
			goSheets.add(root)
		}
	}

	// A tile under the pointer, or holding focus, shows its Connect (Vue's .ds-apptile:hover and :focus-within).
	private tile(event: Event, attr: 'data-go-hover' | 'data-go-focus', on: boolean) {
		const go = (event.currentTarget as HTMLElement).querySelector('[data-go]')
		go?.toggleAttribute(attr, on)
		go?.toggleAttribute('data-go-on', go.hasAttribute('data-go-focus') || go.hasAttribute('data-go-busy'))
	}

	render() {
		const [pixel, pop, dots, mark, button] = ['pixel-button', 'code-pop', 'dot-matrix', 'app-mark', 'button'].map(tag)
		const copied = this.copier.copied
		const n = this.uploading ?? 0
		return html`<div data-ds="add-data" class="flex items-start gap-3">
			<section class="ds-newdata min-w-0 flex-1" data-drag=${ifDefined(this.dragging > 0 ? 'true' : undefined)} aria-label="add data" @dragenter=${(e: DragEvent) => { e.preventDefault(); this.dragging++ }} @dragover=${(e: DragEvent) => e.preventDefault()} @dragleave=${(e: DragEvent) => { e.preventDefault(); this.dragging-- }} @drop=${(e: DragEvent) => this.dropped(e)}>
				<h3 class="type-ui-strong">Send by API</h3>
				<div class="flex flex-wrap items-center gap-2">
					<${pixel} ?done=${copied} @click=${() => void this.copyPrompt()}><span class="ds-newdata-swap" data-on=${ifDefined(copied ? 'true' : undefined)}><span class="ds-newdata-swap-a">${icon(Copy, 'copy', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Copy prompt for your agent</span><span class="ds-newdata-swap-b" aria-hidden="true">${icon(Check, 'check', { size: 12, strokeWidth: 2 })}Copied</span></span></${pixel}>
					<${pop} .code=${this.code}></${pop}>
				</div>
				${this.waiting
					? html`<p class="flex flex-wrap items-center gap-1.5 type-meta" role="status">${this.landed
						? html`${icon(Check, 'check', { size: 12, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } })}1 document landed in <span class="type-code-sm">${this.namespace}</span>`
						: html`<${dots}></${dots}>Waiting for your first document`}${this.landed ? html`<${pixel} data-push @click=${() => this.emit('open', { namespace: this.namespace })}>${`Open ${this.namespace}`}</${pixel}>` : nothing}</p>`
					: nothing}

				<h3 class="type-ui-strong">Or connect an app</h3>
				<ul class="ds-apptiles">${repeat((this.apps ?? []).slice(0, 8), (a) => a.type, (a) => {
					const busy = this.connecting === a.type
					return html`<li class="ds-apptile" data-busy=${ifDefined(busy ? 'true' : undefined)} @click=${() => this.emit('connect', { app: a })} @pointerenter=${(e: Event) => this.tile(e, 'data-go-hover', true)} @pointerleave=${(e: Event) => this.tile(e, 'data-go-hover', false)} @focusin=${(e: Event) => this.tile(e, 'data-go-focus', true)} @focusout=${(e: Event) => this.tile(e, 'data-go-focus', false)}>
						<${mark} data-tile-mark .name=${a.name} .logo=${a.logo} size="20"></${mark}>
						<span class="max-w-full truncate">${a.name}</span>
						<${pixel} data-go ?data-go-busy=${busy} ?data-go-on=${busy} ?disabled=${!!this.connecting} aria-label=${`connect ${a.name}`} @click=${(e: Event) => { e.stopPropagation(); this.emit('connect', { app: a }) }}>${busy ? 'Opening' : 'Connect'}</${pixel}>
					</li>`
				})}</ul>

				<p class="type-meta text-fg-muted" aria-live="polite">${n
					? html`<${dots} class="mr-1.5 inline-grid"></${dots}>${`Uploading ${n === 1 ? '1 file' : `${n} files`}`}`
					: html`Or drop files here, or <button type="button" class="ds-newdata-link" @click=${() => this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>choose files</button>.`}</p>
				${this.error ? html`<p class="bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">${this.error}</p>` : nothing}
				<input type="file" multiple hidden @change=${(e: Event) => this.picked(e)}>
			</section>
			${this.closable ? html`<${button} variant="ghost" icon aria-label="close add data" @click=${() => this.emit('close')}>${icon(X, 'x', { size: 14, strokeWidth: 1.5 })}</${button}>` : nothing}
		</div>`
	}
}

define('add-data', AddData)
