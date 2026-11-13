import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/visuals/grain'
import '@/elements/components/visuals/cell-burst'
import styles from 'virtual:tw'

// WorkPanel.vue as <conare-work-panel>: a page whose job is one action with a visible result (SetupStep.vue, console2.css .v2-agentwork): the step's card
// beside the dark panel in the website's double rule, side by side from 640px of room. The card has the title in
// Faculty Glyphic with a red full stop, one line, and its action at the foot (default slot: one large PixelButton,
// secondary buttons beside it). The panel is the grain and a sheet of cells (`seed`) with one window on it (`window`
// slot), which plays once. Title, line and action rise in once, a blur clearing. `tall` keeps the panel at 372px, as
// Getting started's steps do, so moving between steps moves nothing.
// `heading` is Vue's `title` (HTML's tooltip attribute is `title`). The action's buttons are slotted, so the rule that
// sizes Vue's plain buttons reaches them as ::slotted.

/**
 * @summary One action with a visible result: the step's card beside the dark panel.
 * @slot - The action: one large pixel button, secondary buttons beside it.
 * @slot window - The one window on the panel.
 */
export class WorkPanel extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, line: {}, seed: { type: Number }, tall: { type: Boolean }, label: {} }

	/** The step's title (Vue's `title`). */
	heading = ''
	/** Its one line. */
	line?: string
	/** Which cells the panel lights. */
	seed = 5
	/** Keeps the panel at 372px. */
	tall = false
	/** The section's name for assistive tech. */
	label?: string

	render() {
		return html`<div data-ds="work-panel" class="ds-work"><section class="ds-work-grid" aria-label=${this.label ?? nothing}><div class="ds-work-card"><h2 class="ds-work-title ds-work-rise">${this.heading}<span class="text-fg-accent-display">.</span></h2>${this.line ? html`<p class="ds-work-line ds-work-rise" style="--i: 1">${this.line}</p>` : nothing}${this.hasSlot() ? html`<div class="ds-work-act ds-work-rise" style="--i: 2"><slot></slot></div>` : nothing}</div><div aria-hidden="true" class="ds-work-panel" ?data-tall=${this.tall}>${staticHtml`<${tag('grain')}></${tag('grain')}>`}<div class="pointer-events-none absolute inset-0 opacity-70">${staticHtml`<${tag('cell-burst')} seed=${this.seed}></${tag('cell-burst')}>`}</div><div class="relative flex w-full items-center justify-center px-4 py-6"><slot name="window"></slot></div></div></section></div>`
	}
}

define('work-panel', WorkPanel)
