import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/site-tag'
import styles from 'virtual:tw'

// SectionHead.vue as <conare-section-head>: how the website heads a page or a band (pricing.vue's head, Tag.vue, the
// blog and the bands of the home): the red tag in the site's capitals, then the line in Faculty Glyphic, 24px (32px
// from 640px) on 1.15 lines, balanced; under it one muted line and the one action (`action` slot), each 16px and 32px
// down. Centred by default; align="start" starts it at the left, for a head beside its content. as="h1" for the
// page's own head, h2 for a band. `heading` is Vue's `title`.

/**
 * @summary The website's head of a page or a band: tag, line, one muted line, one action.
 * @slot action - The one action: a button-link.
 */
export class SectionHead extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, tag: {}, body: {}, as: {}, align: {}, titleId: { attribute: 'title-id' } }

	/** The line (Vue's `title`). */
	heading = ''
	/** The red tag above it. */
	tag?: string
	/** One muted line under it. */
	body?: string
	/** h1 for a page's own head, h2 for a band. */
	as: 'h1' | 'h2' = 'h2'
	/** center or start. */
	align: 'center' | 'start' = 'center'
	/** The heading's id, which names the band around it. */
	titleId?: string

	render() {
		const classes = 'ds-section-title max-w-[640px] font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1'
		const heading = this.as === 'h1'
			? html`<h1 id=${ifDefined(this.titleId)} class=${classes}>${this.heading}</h1>`
			: html`<h2 id=${ifDefined(this.titleId)} class=${classes}>${this.heading}</h2>`
		return html`<div data-ds="section-head" class=${this.align === 'center' ? 'flex flex-col items-center text-center' : 'flex flex-col items-start text-left'}>${this.tag ? html`<p class="mb-4 flex">${staticHtml`<${tag('site-tag')}>${this.tag}</${tag('site-tag')}>`}</p>` : nothing}${heading}${this.body ? html`<p class="mt-4 max-w-[560px] text-input text-fg-muted">${this.body}</p>` : nothing}${this.hasSlot('action') ? html`<div class="mt-8"><slot name="action"></slot></div>` : nothing}</div>`
	}
}

define('section-head', SectionHead)
