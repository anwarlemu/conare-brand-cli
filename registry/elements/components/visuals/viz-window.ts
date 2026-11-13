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
// alone, the `title` slot and the default slot hold plain content. `stretch` makes it fill its box, for a frame that
// sizes it (blog-card's picture sets it on the window in its `window` slot).

// Used with plain content in its slots (a page's own window), the parts are the page's: the window adopts these rules
// (the sheet above for its light DOM: the host's `active` for Vue's data-active) into the tree it sits in, once.
const LIGHT = `
[data-ds="viz-window"] {
.ds-viz-chip { display: inline-flex; align-items: center; gap: 6px; padding: 1px 6px; background: var(--ds-color-neutral-200); font-size: var(--ds-text-meta); line-height: 18px; vertical-align: 1px; white-space: nowrap; }
.ds-viz-tag { padding: 0 6px; border: var(--ds-border-hairline) solid var(--ds-color-neutral-300); color: var(--ds-color-neutral-500); font-size: var(--ds-text-caption); line-height: 18px; white-space: nowrap; }
.ds-viz-dot { width: 6px; height: 6px; flex-shrink: 0; }
.ds-viz-progress { display: flex; height: var(--ds-size-row); align-items: center; gap: var(--ds-space-lg); padding: 0 12px; border: var(--ds-border-hairline) solid var(--ds-color-neutral-300); font-size: var(--ds-text-meta); line-height: 16px; }
.ds-viz-matrix { display: grid; grid-template-columns: repeat(3, 2px); gap: var(--ds-space-2xs); flex-shrink: 0; }
.ds-viz-matrix i { width: 2px; height: 2px; background: var(--ds-color-neutral-500); }
&[active] .ds-viz-matrix i { animation: ds-viz-blink 900ms steps(1, end) infinite; animation-delay: calc(var(--k) * 100ms); }
.ds-viz-timer { flex-shrink: 0; color: var(--ds-color-neutral-500); font-variant-numeric: tabular-nums; counter-reset: viz-s var(--viz-s); }
.ds-viz-timer::after { content: "00:" counter(viz-s, decimal-leading-zero); }
&[active] .ds-viz-timer { animation: ds-viz-count calc(var(--to) * var(--ds-duration-viz-tick)) steps(var(--to), end) both; animation-delay: calc(var(--d) * 1ms); }
.ds-viz-shimmer { background: linear-gradient(90deg, var(--ds-color-neutral-500) 30%, var(--ds-color-off-white) 50%, var(--ds-color-neutral-500) 70%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
&[active] .ds-viz-shimmer { animation: ds-viz-shimmer var(--ds-duration-viz-shimmer) linear calc(var(--d) / 1400 + 0.2), ds-viz-out var(--ds-duration-enter) ease both; animation-delay: 0ms, calc(var(--d) * 1ms); }
.ds-viz-card, .ds-viz-in, .ds-viz-swap-b { opacity: 0; }
&[active] .ds-viz-card { animation: ds-viz-card var(--ds-duration-viz-card) var(--ds-easing-viz) 80ms both; }
&[active] .ds-viz-in { animation: ds-viz-in var(--ds-duration-viz-in) var(--ds-easing-viz) both; animation-delay: calc(var(--d) * 1ms); }
&[active] .ds-viz-swap-a:not(.ds-viz-shimmer) { animation: ds-viz-out var(--ds-duration-enter) ease both; animation-delay: calc(var(--d) * 1ms); }
&[active] .ds-viz-swap-b { animation: ds-viz-in var(--ds-duration-entrance) var(--ds-easing-out) both; animation-delay: calc(var(--d) * 1ms + 120ms); }
.ds-viz-row { opacity: 0; transform: translateY(calc(var(--from) * var(--track, 48px))); }
&[active] .ds-viz-row { animation: ds-viz-in var(--ds-duration-viz-row) var(--ds-easing-out) both, ds-viz-rank var(--ds-duration-viz-in) var(--ds-easing-swap) both; animation-delay: calc(var(--d) * 1ms), 2400ms; }
.ds-viz-bar { clip-path: inset(0 100% 0 0); }
&[active] .ds-viz-bar { animation: ds-viz-bar var(--ds-duration-viz-bar) var(--ds-easing-out) both; animation-delay: calc(var(--d) * 1ms); }
&:not([active]) :is(.ds-viz-card, .ds-viz-in, .ds-viz-swap-b, .ds-viz-row) { opacity: 1; }
&:not([active]) .ds-viz-swap-a { opacity: 0; }
&:not([active]) .ds-viz-row { transform: translateY(calc(var(--to) * var(--track, 48px))); }
&:not([active]) .ds-viz-bar { clip-path: inset(0 calc((1 - var(--w)) * 100%) 0 0); }
&:not([active]) .ds-viz-timer { --viz-s: var(--to); }
.ds-viz-body { opacity: 0; visibility: hidden; transition: opacity var(--ds-duration-slide) ease, visibility 0s linear 180ms; }
.ds-viz-body[data-active="true"] { opacity: 1; visibility: visible; transition: opacity var(--ds-duration-micro) ease, visibility 0s; }
.ds-viz-body:not([data-active="true"]) * { animation-play-state: paused !important; }
.ds-viz-title { opacity: 0; transition: opacity var(--ds-duration-slide) ease; }
.ds-viz-title[data-active="true"] { opacity: 1; transition: opacity var(--ds-duration-micro) ease; }
@media (prefers-reduced-motion: reduce) {
  &[active] :is(.ds-viz-card, .ds-viz-in, .ds-viz-swap-a, .ds-viz-swap-b, .ds-viz-row, .ds-viz-bar, .ds-viz-timer, .ds-viz-shimmer, .ds-viz-matrix i) { animation: none; }
  & :is(.ds-viz-card, .ds-viz-in, .ds-viz-swap-b, .ds-viz-row) { opacity: 1; }
  & .ds-viz-swap-a { opacity: 0; }
  & .ds-viz-row { transform: translateY(calc(var(--to) * var(--track, 48px))); }
  & .ds-viz-bar { clip-path: inset(0 calc((1 - var(--w)) * 100%) 0 0); }
  & .ds-viz-timer { --viz-s: var(--to); }
  .ds-viz-body, .ds-viz-body[data-active="true"], .ds-viz-title, .ds-viz-title[data-active="true"] { transition: none; }
}
}
@property --viz-s { syntax: "<integer>"; inherits: false; initial-value: 0; }
@keyframes ds-viz-card { from { opacity: 0; transform: translateY(16px) scale(0.985); } to { opacity: 1; transform: none; } }
@keyframes ds-viz-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes ds-viz-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes ds-viz-rank { from { transform: translateY(calc(var(--from) * var(--track, 48px))); } to { transform: translateY(calc(var(--to) * var(--track, 48px))); } }
@keyframes ds-viz-bar { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 calc((1 - var(--w)) * 100%) 0 0); } }
@keyframes ds-viz-blink { 0% { background: var(--ds-color-off-white); } 34% { background: var(--ds-color-neutral-500); } }
@keyframes ds-viz-count { from { --viz-s: 0; } to { --viz-s: var(--to); } }
@keyframes ds-viz-shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
`
let lightSheet: CSSStyleSheet | undefined
const adopted = new WeakSet<Document | ShadowRoot>()

/**
 * @summary The website's dark product window: a card that rises in with its parts.
 * @slot title - What the bar says after the mark.
 * @slot - The window's body.
 */
export class VizWindow extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { active: { type: Boolean, reflect: true }, size: {}, stretch: { type: Boolean, reflect: true }, relative: { type: Boolean } }

	/** Plays the entrance; inactive, it holds its finished state. */
	active = false
	/** `sm`: the product cards' 36px bar with two controls. */
	size: 'sm' | 'md' = 'md'
	/** Fills its box (full height, no max width). */
	stretch = false
	/** Positions its box (Vue's class="relative" on the window), so it paints over an absolute sibling such as a cell-burst. */
	relative = false

	connectedCallback() {
		super.connectedCallback()
		if (!this.children.length) return
		const root = this.getRootNode()
		if (!(root instanceof Document || root instanceof ShadowRoot) || adopted.has(root)) return
		adopted.add(root)
		lightSheet ??= new CSSStyleSheet()
		if (!lightSheet.cssRules.length) lightSheet.replaceSync(LIGHT)
		root.adoptedStyleSheets = [...root.adoptedStyleSheets, lightSheet]
	}

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
		return html`<div data-ds="${name}" class=${['ds-viz w-full min-w-0 text-input', this.rootClass(), this.relative ? 'relative' : ''].join(' ')} data-active=${String(this.active)}><div class="ds-viz-card border border-ds-neutral-300 bg-ds-neutral-100 text-off-white"><div class=${['flex items-center gap-2', sm ? 'h-9 px-3' : 'h-11 px-4'].join(' ')}><svg viewBox="0 0 149 134" width=${sm ? 12 : 14} height=${sm ? 10 : 12} class=${['w-auto shrink-0', sm ? 'h-2.5' : 'h-3'].join(' ')} fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z"></path></svg>${this.renderTitle()}<span class=${['ml-auto flex shrink-0 items-center text-ds-neutral-500', sm ? 'gap-2' : 'gap-3'].join(' ')} aria-hidden="true"><svg width=${sm ? 8 : 10} height=${sm ? 8 : 10} viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 7h8"></path></svg>${!sm ? html`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 1h3v3M4 9H1V6M9 1 6 4M1 9l3-3"></path></svg>` : nothing}<svg width=${sm ? 8 : 10} height=${sm ? 8 : 10} viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m1.5 1.5 7 7m0-7-7 7"></path></svg></span></div>${this.renderBody()}</div></div>`
	}
}

define('viz-window', VizWindow)
