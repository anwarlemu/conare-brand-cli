import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ButtonGroup.vue as <conare-button-group>: buttons that belong together, sharing a hairline (from agent-prompt's split
// button, console2.css .v2-split): each child overlaps the one before by 1px so two edges read as one, and the one
// under the pointer or focus sits on top so its ink edge shows whole. Secondary buttons, a dark button with its menu
// arrow (the split button: a 24% white hairline divides two dark halves), or a field with its button. `vertical` stacks
// them. Give it a label for the group.
//
// Vue's rules reach each child's root (`.ds-btngroup > *`). A library element such as <conare-button> draws its root in
// its own shadow root, so the group marks each child with what Vue's selectors decide (data-group-overlap, -divide) and
// gives that shadow root a small sheet that draws it on the root there; a child that is its own box takes the rules in
// button-group.css; a dark trigger inside a child (a menu's) takes its hairline from a rule given to the page.

const HAIRLINE = 'position: absolute; inset: 0 auto 0 0; width: 1px; background: color-mix(in srgb, var(--ds-color-fg-inverse) 24%, transparent); content: "";'

// For a child's shadow root: the child's root box is the shadow root's element with data-ds.
const CHILD_RULES = `
:host([data-group]) > [data-ds] { position: relative; }
:host([data-group-overlap="x"]) > [data-ds] { margin-left: -1px; }
:host([data-group-overlap="y"]) > [data-ds] { margin-top: -1px; }
:host([data-group]) > [data-ds]:is(:hover, :focus-visible, :focus-within) { z-index: 1; }
:host([data-group-divide="self"]) > [data-ds]::after { ${HAIRLINE} }
`
const childSheets = new WeakSet<ShadowRoot>()
function adoptChildRules(root: ShadowRoot) {
	if (childSheets.has(root)) return
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(CHILD_RULES)
	root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
	childSheets.add(root)
}
// For the page (or the shadow root the group sits in): a child that is its own box, and a dark trigger inside a child.
const pageSheets = new WeakSet<Document | ShadowRoot>()
function adoptPageRules(root: Node) {
	if (!(root instanceof Document || root instanceof ShadowRoot) || pageSheets.has(root)) return
	const g = tagName('button-group')
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(`${g} > [data-group-divide="self"]::after, ${g} > [data-group-divide="child"] > .bg-action-primary::after { ${HAIRLINE} }`)
	root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
	pageSheets.add(root)
}

const DARK = '.bg-action-primary, .ds-px'

/**
 * @summary Buttons that belong together, sharing a hairline.
 * @slot - The buttons (and a menu, or a field with its button).
 */
export class ButtonGroup extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, vertical: { type: Boolean } }

	/** The group's name. */
	label?: string
	/** Stacked. */
	vertical = false

	connectedCallback() {
		super.connectedCallback()
		adoptPageRules(this.getRootNode())
	}

	/** The box a child draws: its shadow root's root when its host lays out nothing, else the child itself. */
	private box(child: HTMLElement) {
		const root = child.shadowRoot
		if (root && getComputedStyle(child).display === 'contents') return root.querySelector<HTMLElement>('[data-ds]') ?? child
		return child
	}

	private async mark() {
		const kids = [...this.children] as HTMLElement[]
		// Library elements draw their roots once defined and rendered.
		await Promise.all(kids.filter((k) => k.localName.includes('-')).map(async (k) => {
			await customElements.whenDefined(k.localName)
			await (k as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete
		}))
		const dark = kids.map((k) => this.box(k).matches(DARK))
		kids.forEach((k, i) => {
			if (k.shadowRoot && this.box(k) !== k) adoptChildRules(k.shadowRoot)
			k.setAttribute('data-group', '')
			const prevDark = i > 0 && dark[i - 1]
			// `> * + *` overlaps by 1px; after a dark half, the next sits flush (`dark + *` margin-left: 0).
			const overlap = i === 0 ? null : this.vertical ? 'y' : prevDark ? null : 'x'
			if (overlap) k.setAttribute('data-group-overlap', overlap)
			else k.removeAttribute('data-group-overlap')
			// Two dark halves: the hairline on the second, on itself or on the dark trigger inside it.
			const divide = !prevDark ? null : dark[i] ? 'self' : k.querySelector(':scope > .bg-action-primary') ? 'child' : null
			if (divide) k.setAttribute('data-group-divide', divide)
			else k.removeAttribute('data-group-divide')
		})
	}

	protected updated() {
		void this.mark()
	}

	render() {
		return html`<div data-ds="button-group" class="ds-btngroup" role="group" aria-label=${ifDefined(this.label)} ?data-vertical=${this.vertical}><slot @slotchange=${() => void this.mark()}></slot></div>`
	}
}

define('button-group', ButtonGroup)
