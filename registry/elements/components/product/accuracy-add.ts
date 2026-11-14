import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { FileUp, X } from 'lucide'
import '@/elements/components/ui/button'
import '@/elements/components/ui/pixel-button'
import styles from 'virtual:tw'

// AccuracyAdd.vue as <conare-accuracy-add>: More questions, opened in place (accuracy/Add.vue), on the paper in a hairline. Three ways in: paste a list (one a
// line), upload a CSV (its first column), or take what agents already ask, which needs no typing and is the truest
// test. Adding runs them, since a question only helps answered: `add` carries the questions ({{ questions }}), `close` the close button.
const count = (n: number) => `${n} ${n === 1 ? 'question' : 'questions'}`

/**
 * @summary More questions, opened in place: paste, upload a CSV, or take what agents ask.
 * @fires add - Add and run was pressed ({ questions }).
 * @fires close - The close button was pressed.
 */
export class AccuracyAdd extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { asked: { type: Array }, text: { state: true } }

	/** What agents already ask, offered to take. */
	asked: string[] = []
	private text = ''

	private async file(list: FileList | null) {
		const f = list?.[0]
		if (!f) return
		this.text = (await f.text()).split('\n').map((l) => l.split(',')[0]!.replace(/^"|"$/g, '').trim()).filter(Boolean).join('\n')
	}

	render() {
		const lines = this.text.split('\n').map((l) => l.trim()).filter(Boolean)
		const b = tag('button')
		return html`<section data-ds="accuracy-add" class="grid grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-6 border border-edge bg-surface-subtle p-4 max-lg:grid-cols-1" aria-label="add questions"><div class="min-w-0 flex-1"><label class="sr-only" for="eval-more">questions, one a line</label><textarea id="eval-more" .value=${this.text} @input=${(e: Event) => { this.text = (e.target as HTMLTextAreaElement).value }} class="block w-full resize-y border border-edge-strong bg-surface p-3 text-ui outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus max-md:text-input" rows="5" placeholder="One question a line"></textarea><div class="mt-2 flex flex-wrap items-center gap-2">${staticHtml`<${tag('pixel-button')} ?disabled=${!lines.length} @click=${() => this.emit('add', { questions: lines })}>${lines.length ? `Add ${count(lines.length)} and run` : 'Add and run'}</${tag('pixel-button')}><${b} press @click=${() => this.renderRoot.querySelector<HTMLInputElement>('input[type=file]')?.click()}>${icon(FileUp, 'file-up', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Upload a CSV</${b}>`}<input type="file" accept=".csv,.txt" class="sr-only" tabindex="-1" aria-label="choose a CSV of questions" @change=${(e: Event) => void this.file((e.target as HTMLInputElement).files)}><span class="ml-auto inline-flex">${staticHtml`<${b} variant="ghost" icon press aria-label="close" @click=${() => this.emit('close')}>${icon(X, 'x', { size: 14, strokeWidth: 1.5 })}</${b}>`}</span></div></div>${this.asked.length ? html`<div><p class="mb-1 type-meta text-fg-muted">What your agents ask most</p>${this.asked.map((q) => html`<button type="button" class="ds-askedq" @click=${() => { this.text = this.text ? this.text + '\n' + q : q }}>${q}</button>`)}</div>` : nothing}</section>`
	}
}

define('accuracy-add', AccuracyAdd)
