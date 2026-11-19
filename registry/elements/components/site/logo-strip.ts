import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/site/section-head'
import styles from 'virtual:tw'

// LogoStrip.vue as <conare-logo-strip>: who uses it or what it connects to (Integrations.vue): the band's head, then a
// 64px cell per name in the website's double rule, two across on phones, three from 640px and six from 1024px. Each
// name is a wordmark drawn as text in the type's colour, never a company's real logo; `mark` puts a small square
// before it. Pass multiples of six. `heading` is Vue's `title`.
export type Logo = { name: string, mark?: boolean }

/** @summary Who uses it: a cell per wordmark in the website's double rule. */
export class LogoStrip extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, tag: {}, logos: { type: Array }, titleId: { attribute: 'title-id' } }

	/** The band's line (Vue's `title`). */
	heading = ''
	tag?: string
	/** Each { name, mark }. */
	logos: Logo[] = []
	titleId = 'logos-title'

	render() {
		const head = tag('section-head')
		return html`<section data-ds="logo-strip" aria-labelledby=${this.titleId} class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10">${staticHtml`<${head} .heading=${this.heading} .tag=${this.tag} .titleId=${this.titleId}></${head}>`}<ul class="mt-8 grid grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-3 lg:grid-cols-6">${this.logos.map((logo) => html`<li class="flex h-16 items-center justify-center gap-2 bg-surface px-3 text-body-lg font-medium tracking-tight text-fg">${logo.mark ? html`<span aria-hidden="true" class="size-2 shrink-0 bg-fg"></span>` : nothing}<span class="truncate">${logo.name}</span></li>`)}</ul></section>`
	}
}

define('logo-strip', LogoStrip)
