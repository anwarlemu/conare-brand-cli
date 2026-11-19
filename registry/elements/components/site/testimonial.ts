import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/avatar'
import '@/elements/components/ui/site-tag'
import styles from 'virtual:tw'

// Testimonial.vue as <conare-testimonial>: one customer's words, in the website's double rule (the FAQ's frame): the
// tag, the quote in Faculty Glyphic 24px (32px from 640px) on 1.2 lines, balanced and centred in 880px, then who said
// it: the company's square initial, the role in ink and the company muted. Attribute a quote to a role, never invent
// a person. `job-title` is Vue's `role`.

/** @summary One customer's words, attributed to a role at the company. */
export class Testimonial extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { quote: {}, jobTitle: { attribute: 'job-title' }, company: {}, tag: {} }

	quote = ''
	/** Who said it: a role at the company (Vue's `role`; `role` is HTML's ARIA attribute). */
	jobTitle = ''
	company = ''
	tag = 'Customers'

	render() {
		const siteTag = tag('site-tag')
		const avatar = tag('avatar')
		return html`<section data-ds="testimonial" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32"><figure class="mx-auto flex max-w-[1200px] flex-col items-center border border-edge px-5 py-14 text-center outline outline-offset-4 outline-edge sm:px-10 sm:py-20"><p class="mb-8 flex">${staticHtml`<${siteTag}>${this.tag}</${siteTag}>`}</p><blockquote class="ds-quote max-w-[880px] font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1">${this.quote}</blockquote><figcaption class="mt-10 flex items-center gap-3 text-left">${staticHtml`<${avatar} name=${this.company} variant="solid" initial size="32"></${avatar}>`}<span class="flex flex-col"><span class="type-body text-fg">${this.jobTitle}</span><span class="type-meta text-fg-muted">${this.company}</span></span></figcaption></figure></section>`
	}
}

define('testimonial', Testimonial)
