import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/visuals/grain'
import '@/elements/components/visuals/cell-burst'
import styles from 'virtual:tw'

// CallToAction.vue as <conare-call-to-action>: the band before the website's footer (Cta.vue): the closing line and one
// action, centred on the red under the grain and a jumbled sheet of cells whose grid keeps redrawing itself (cell-burst
// jumble strong trace). A triple rule, the FAQ's width: the panel's border, an outline 4px out, and the frame's border
// 4px beyond that. Put the one action in the default slot: a light button-link with fill="black", so its squares come
// in black on the red.

/**
 * @summary The closing band before the footer: one line and one action on the red.
 * @slot - The one action.
 */
export class CallToAction extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, seed: { type: Number }, titleId: { attribute: 'title-id' } }

	/** The closing line (Vue's `title`). */
	heading = ''
	/** Which cells the burst lights. */
	seed = 53
	/** The heading's id, which names the band. */
	titleId = 'cta-title'

	render() {
		return html`<section data-ds="call-to-action" aria-labelledby=${this.titleId} class="mx-auto max-w-[1440px] px-4 pb-32 sm:px-6 lg:px-10 lg:pb-40"><div class="mx-auto max-w-[1220px] border border-edge p-2.25"><div class="relative overflow-hidden border border-edge bg-home-red outline outline-offset-4 outline-edge">${staticHtml`<${tag('grain')}></${tag('grain')}><${tag('cell-burst')} seed=${this.seed} jumble strong trace></${tag('cell-burst')}>`}<div class="relative flex flex-col items-center px-4 py-24 text-center sm:py-32"><h2 id=${this.titleId} class="ds-cta-title font-heading text-heading-1 font-normal tracking-display text-off-white sm:text-display">${this.heading}</h2>${this.hasSlot() ? html`<div class="mt-8"><slot></slot></div>` : nothing}</div></div></div></section>`
	}
}

define('call-to-action', CallToAction)
