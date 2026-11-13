import { type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ChevronDown, Code } from 'lucide'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/code-block'
import styles from 'virtual:tw'

// CodePop.vue as <conare-code-pop>: code that opens from its own button (the console's CodePop.vue, version 2, the one
// picked): no overlay, the code takes its own line under the row, in the dark code window, and pushes what follows. The
// row grows from 0fr over 200ms (back in 140ms), the window settles 6px down into place, and the label swaps to "Hide
// code" in the same box, so the button keeps its width. The chevron turns as it opens and starts turning on the press.
// The trigger and the code sit in the caller's row (display: contents): put it in a wrapping flex row; it takes the
// row's end. `large` is the 36px size, beside a large dark button. Vue's `title` is `heading`.

/** @summary A Show code button whose code opens on its own line under the row. */
export class CodePop extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { code: {}, label: {}, heading: {}, tab: {}, opened: { type: Boolean }, large: { type: Boolean }, open: { state: true } }

	/** The code to show. */
	code = ''
	/** The button's word while closed. */
	label = 'Show code'
	/** The code region's name (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = 'This request in your code'
	/** The window's pill (cURL, Shell...). */
	tab?: string
	/** Open from the start. */
	opened = false
	/** The 36px size. */
	large = false
	private open = false
	private panelId = uid('codepop')
	private timer?: ReturnType<typeof setTimeout>

	protected willUpdate(changed: PropertyValues) {
		if (!this.hasUpdated && changed.has('opened')) this.open = this.opened
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.timer)
	}

	// It opens under its button, which can sit low on the screen, so the code lands in view once the row has grown.
	private toggle() {
		this.open = !this.open
		clearTimeout(this.timer)
		// ds-latency: waits for the row to finish growing before bringing it into view; the code shows at once.
		if (this.open) this.timer = setTimeout(() => this.renderRoot.querySelector('.ds-codepop')?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 200)
	}

	render() {
		const open = this.open
		const on = (v: boolean) => ifDefined(v ? 'true' : undefined)
		const block = tag('code-block')
		return html`<div data-ds="code-pop" class="contents" data-codepop>
			<button type="button" class="ds-codepop-btn" data-large=${on(this.large)} aria-expanded=${String(open)} aria-controls=${this.panelId} @click=${() => this.toggle()}>
				${icon(Code, 'code', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}
				<span class="ds-codepop-stack"><span data-on=${on(!open)} aria-hidden=${String(open)}>${this.label}</span><span data-on=${on(open)} aria-hidden=${String(!open)}>Hide code</span></span>
				${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'ds-codepop-chev', attrs: { 'aria-hidden': 'true' } })}
			</button>
			<div id=${this.panelId} class="ds-codepop" data-open=${on(open)} ?inert=${!open} role="region" aria-label=${this.heading}>
				<div class="ds-codepop-clip">
					<${block} class="ds-codepop-win" .code=${this.code} .label=${this.tab}></${block}>
				</div>
			</div>
		</div>`
	}
}

define('code-pop', CodePop)
