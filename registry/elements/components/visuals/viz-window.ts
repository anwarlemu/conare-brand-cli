import { html, nothing, type TemplateResult } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// VizWindow.vue as <conare-viz-window>: the website's product windows (home.css .viz-*), the frame the eval, product,
// price and step windows share: a dark square card in a hairline, the white mark and a title in its bar, the window
// controls on the right. While `active` the card rises in over 900ms on a long ease-out and its parts (.ds-viz-in, each
// with its own `--d` delay in ms) follow; inactive, everything holds its finished state. Explanatory motion: it plays
// once per activation, on opacity, transform and clip-path only. Reduced motion shows the finished window at once.
// `size="sm"` is the product cards' 36px bar with two controls.
//
// The parts' rules (.ds-viz-in, .ds-viz-bar, .ds-viz-chip...) cannot reach content slotted from another shadow root,
// so a window with its own parts (<conare-eval-viz>) extends this class: it draws its title and body by overriding
// renderTitle() and renderBody() and its root says its own data-ds, as Vue's fallthrough attribute makes it. Used
// alone, the `title` slot and the default slot hold plain content.

/**
 * @summary The website's dark product window: a card that rises in with its parts.
 * @slot title - What the bar says after the mark.
 * @slot - The window's body.
 */
export class VizWindow extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { active: { type: Boolean }, size: {} }

	/** Plays the entrance; inactive, it holds its finished state. */
	active = false
	/** `sm`: the product cards' 36px bar with two controls. */
	size: 'sm' | 'md' = 'md'

	/** Classes on the root after its own (Vue's class on the component). */
	protected rootClass(): string {
		return ''
	}
	/** What the bar says after the mark. */
	protected renderTitle(): TemplateResult | typeof nothing {
		return html`<slot name="title"></slot>`
	}
	/** The window's body. */
	protected renderBody(): TemplateResult | typeof nothing {
		return html`<slot></slot>`
	}

	render() {
		const sm = this.size === 'sm'
		const name = (this.constructor as typeof DsElement).dsName
		return html`<div data-ds="${name}" class=${['ds-viz w-full min-w-0 text-input', this.rootClass()].join(' ')} data-active=${String(this.active)}><div class="ds-viz-card border border-ds-neutral-300 bg-ds-neutral-100 text-off-white"><div class=${['flex items-center gap-2', sm ? 'h-9 px-3' : 'h-11 px-4'].join(' ')}><svg viewBox="0 0 149 134" width=${sm ? 12 : 14} height=${sm ? 10 : 12} class=${['w-auto shrink-0', sm ? 'h-2.5' : 'h-3'].join(' ')} fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z"></path></svg>${this.renderTitle()}<span class=${['ml-auto flex shrink-0 items-center text-ds-neutral-500', sm ? 'gap-2' : 'gap-3'].join(' ')} aria-hidden="true"><svg width=${sm ? 8 : 10} height=${sm ? 8 : 10} viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 7h8"></path></svg>${!sm ? html`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 1h3v3M4 9H1V6M9 1 6 4M1 9l3-3"></path></svg>` : nothing}<svg width=${sm ? 8 : 10} height=${sm ? 8 : 10} viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m1.5 1.5 7 7m0-7-7 7"></path></svg></span></div>${this.renderBody()}</div></div>`
	}
}

define('viz-window', VizWindow)
