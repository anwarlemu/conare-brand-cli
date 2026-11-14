import { html, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { CopyController } from '@/elements/controllers/copy'
import { Check, Link2, Plus, RotateCw } from 'lucide'
import type { AccuracyView } from '@/elements/components/product/accuracy-detail'
import '@/elements/components/product/accuracy-add'
import '@/elements/components/product/accuracy-at-work'
import '@/elements/components/product/accuracy-opens'
import '@/elements/components/product/accuracy-sheet'
import '@/elements/components/product/accuracy-two'
import '@/elements/components/product/accuracy-verdict'
import '@/elements/components/ui/button'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/ui/tabs'
import styles from 'virtual:tw'

// AccuracyPanel.vue as <conare-accuracy-panel>: Accuracy, Performance's second view (accuracy/Panel.vue): a team's own questions and whether Conare reached the
// right page. The bar holds Performance's two views and the test's actions: Add questions (opening in place; the
// question sheet takes them in its first row instead), Copy link, and Run again as the page's one dark button. Under it,
// one of the four views: 4 "Test at work" ships; 1 "Verdict first", 2 "Two searches" and 3 "Question sheet" are the
// takes beside it. The app owns the test: it listens for `run`, `add` ({{ questions }}), `fix`, `search`, `remove` ({{ row }}) and
// the tab (`tab` with `tab-change`, Vue's v-model:tab). The views' and the add form's events pass on out of it.

/**
 * @summary Accuracy, Performance's second view: the bar with the test's actions over one of four views.
 * @fires run - Run again was pressed (and after questions were added).
 * @fires tab-change - The tab changed (read `tab`).
 */
export class AccuracyPanel extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { view: { type: Object }, version: { type: Number }, link: {}, asked: { type: Array }, busy: { type: Boolean }, tab: { reflect: true }, adding: { state: true } }

	view?: AccuracyView
	/** 4 test at work (ships), 1 verdict first, 2 two searches, 3 question sheet. */
	version: 1 | 2 | 3 | 4 = 4
	/** The page's link, for Copy link. */
	link = ''
	/** What agents ask most, offered when adding questions. */
	asked: string[] = []
	busy = false
	tab: 'searches' | 'accuracy' = 'accuracy'
	private adding = false
	private copy = new CopyController(this)

	// The add form's `add` passes on out; then the run.
	private more = () => {
		this.adding = false
		this.emit('run')
	}

	render() {
		const view = this.view
		if (!view) return html``
		const b = tag('button')
		const v = this.version
		const views = v === 1 ? staticHtml`<${tag('accuracy-verdict')} .view=${view}></${tag('accuracy-verdict')}>`
			: v === 2 ? staticHtml`<${tag('accuracy-two')} .view=${view}></${tag('accuracy-two')}>`
				: v === 3 ? staticHtml`<${tag('accuracy-sheet')} .view=${view}></${tag('accuracy-sheet')}>`
					: staticHtml`<${tag('accuracy-at-work')} .view=${view}></${tag('accuracy-at-work')}>`
		return html`<div data-ds="accuracy-panel" class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">${staticHtml`<${tag('tabs')} .value=${this.tab} .options=${[{ value: 'searches', label: 'Searches' }, { value: 'accuracy', label: 'Accuracy' }]} label="performance" @change=${(e: Event) => { this.tab = (e.currentTarget as HTMLElement & { value: 'searches' | 'accuracy' }).value; this.emit('tab-change', { value: this.tab }) }}></${tag('tabs')}>`}<div class="flex flex-wrap items-center gap-2">${v !== 3 ? staticHtml`<${b} press aria-expanded=${String(this.adding)} @click=${() => { this.adding = !this.adding }}>${icon(Plus, 'plus', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Add questions</${b}>` : ''}${staticHtml`<${b} press @click=${() => void this.copy.copy(this.link)}>${this.copy.copied ? icon(Check, 'check', { size: 12, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } }) : icon(Link2, 'link-2', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}${this.copy.copied ? 'Link copied' : 'Copy link'}</${b}><${tag('pixel-button')} ?disabled=${view.state === 'running' || this.busy} @click=${() => this.emit('run')}>${icon(RotateCw, 'rotate-cw', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}${view.state === 'running' ? 'Running' : 'Run again'}</${tag('pixel-button')}>`}</div></div>${staticHtml`<${tag('accuracy-opens')} .rootName=${'accuracy-panel'} ?open=${this.adding && v !== 3}><${tag('accuracy-add')} .asked=${this.asked} @add=${this.more} @close=${() => { this.adding = false }}></${tag('accuracy-add')}></${tag('accuracy-opens')}>`}${views}`
	}
}

define('accuracy-panel', AccuracyPanel)
