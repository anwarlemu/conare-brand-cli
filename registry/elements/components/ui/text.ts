import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Text.vue as <conare-text>: the console's type as one part (main.css @theme, console2.css .v2-title, .v2-meta,
// .v2-mono, .v2-link, Marked.vue). title: 20px Faculty Glyphic, a page's title (a level 1 heading). ui: 13px Geist, the
// default. strong: 13px medium. meta: 12px muted, captions under a field, timestamps. caption: 11px muted, the
// smallest. code: 13px Geist Mono; code-sm: 12px mono, for IDs, keys and namespace names. link: ink text with a quiet
// underline 4px under it that turns ink on hover. mark: a query's word in a passage, medium weight in ink, never a fill.
//
// The host is the text's box (text.css), so a class on <conare-text> (a colour, a margin) lands on it as a class on
// <Text> does, and it takes the role of the variant's tag (heading, paragraph, code, strong). A link is a real <a> (or a
// <button> without `href`) inside, the host staying out of the way. `as` names another tag for its role.
export type TextVariant = 'title' | 'ui' | 'strong' | 'meta' | 'caption' | 'code' | 'code-sm' | 'link' | 'mark'

const TAGS: Record<TextVariant, string> = { 'title': 'h1', 'ui': 'p', 'strong': 'p', 'meta': 'p', 'caption': 'p', 'code': 'code', 'code-sm': 'code', 'link': 'a', 'mark': 'strong' }
// The role each tag has, set on the host through ElementInternals.
const ROLES: Record<string, [string | null, string | null]> = {
	h1: ['heading', '1'], h2: ['heading', '2'], h3: ['heading', '3'], h4: ['heading', '4'], p: ['paragraph', null], code: ['code', null],
	strong: ['strong', null], em: ['emphasis', null], span: [null, null], div: [null, null], li: ['listitem', null], label: [null, null],
}
// Tags that sit in the line, as their own display: inline does.
const INLINE = new Set(['code', 'strong', 'em', 'span', 'label', 'a', 'button'])

/**
 * @summary The console's type as one part.
 * @slot - The text.
 */
export class Text extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { variant: { reflect: true }, as: {}, href: {} }

	variant: TextVariant = 'ui'
	/** The tag whose role it takes, in place of the variant's own. */
	as?: string
	/** On `link`: where it goes (without it, a button). */
	href?: string
	private internals = this.attachInternals()

	get tag() {
		return this.as ?? (this.variant === 'link' && !this.href ? 'button' : TAGS[this.variant] ?? 'p')
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		const tag = this.tag
		const box = tag !== 'a' && tag !== 'button'
		const [role, level] = box ? ROLES[tag] ?? [null, null] : [null, null]
		this.internals.role = role
		this.internals.ariaLevel = level
		this.toggleAttribute('data-inline', box && INLINE.has(tag))
		this.toggleAttribute('data-control', !box)
	}

	render() {
		const tag = this.tag
		if (tag === 'a') return html`<a data-ds="text" href=${this.href ?? ''} class="ds-text-link text-fg"><slot></slot></a>`
		if (tag === 'button') return html`<button data-ds="text" type="button" class="ds-text-link text-fg"><slot></slot></button>`
		return html`<slot></slot>`
	}
}

define('text', Text)
