import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsFormElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Button.vue as a web component, <conare-button>. Every action in the console: square, 28px (40px on phones and
// touch), 12px medium labels. secondary is the default; dark is the one main action of a view; primary the red action;
// ghost a tool in a row; danger removes something (hold it with <conare-hold-button>); brand is the fix for a
// failure. Disabled is grey with a dark label, never faded. `press` gives a little under the pointer. `href` renders a
// link. It is form-associated: type="submit" submits its form, type="reset" resets it. aria-label, aria-description,
// aria-expanded, aria-haspopup and aria-controls on it pass to the inner button (the last three move there, so the
// button opening a dialog or a menu is named expanded once).
export type ButtonVariant = 'secondary' | 'dark' | 'primary' | 'ghost' | 'danger' | 'brand'

// The attributes that move from the element to its inner button, by property.
const MOVED = ['aria-expanded', 'aria-haspopup', 'aria-controls']
const FIELD: Record<string, 'expanded' | 'haspopup' | 'controls'> = { 'aria-expanded': 'expanded', 'aria-haspopup': 'haspopup', 'aria-controls': 'controls' }

const VARIANTS: Record<ButtonVariant, string> = {
	secondary: 'border-action-secondary-edge bg-surface text-fg hover:enabled:border-action-secondary-edge-hover active:enabled:bg-surface-subtle',
	dark: 'border-action-primary bg-action-primary text-action-primary-fg hover:enabled:border-edge-accent hover:enabled:bg-edge-accent',
	primary: 'border-edge-accent bg-edge-accent text-off-white hover:enabled:border-home-red-hover hover:enabled:bg-home-red-hover active:enabled:border-home-red-press active:enabled:bg-home-red-press',
	ghost: 'border-transparent bg-transparent text-fg-soft hover:enabled:border-edge hover:enabled:text-fg active:enabled:bg-surface-subtle disabled:!border-transparent disabled:!bg-transparent disabled:!text-fg-muted',
	danger: 'border-action-danger bg-surface text-action-danger hover:enabled:bg-action-danger-hover hover:enabled:text-off-white disabled:!border-action-danger disabled:!bg-surface disabled:!text-action-danger',
	brand: 'border-home-red-press bg-home-red-press text-off-white hover:enabled:border-surface-inverse hover:enabled:bg-surface-inverse',
}

/**
 * @summary An action: secondary by default, dark, primary, ghost, danger or brand; `icon` for a square icon button.
 * @slot - The label, with a Lucide icon before it if any.
 * @fires click - When pressed (the native click, from the inner button).
 * @csspart control - The inner button or link, for a page's or another element's ::part(control).
 */
export class Button extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static properties = {
		variant: { reflect: true },
		icon: { type: Boolean },
		press: { type: Boolean },
		href: {},
		type: {},
		disabled: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
		expanded: { attribute: false },
		haspopup: { attribute: false },
		controls: { attribute: false },
	}
	static get observedAttributes() {
		return [...super.observedAttributes, ...MOVED]
	}

	/** secondary, dark, primary, ghost, danger or brand. */
	variant: ButtonVariant = 'secondary'
	/** A square icon button (put the name in aria-label). */
	icon = false
	/** Scale 0.97 under the pointer, for buttons pressed often in place. */
	press = false
	/** Renders a link. */
	href?: string
	type: 'button' | 'submit' | 'reset' = 'button'
	disabled = false
	/** The name for assistive tech, passed to the inner button (aria-label on the element). */
	label?: string
	/** A description for assistive tech (a tooltip's text), passed to the inner button (aria-description on the element). */
	description?: string
	/** Whether what it opens is open (the aria-expanded attribute). */
	expanded?: string
	/** What it opens: dialog, menu, listbox (the aria-haspopup attribute). */
	haspopup?: string
	/** The id of what it opens (the aria-controls attribute); the button points at it across its shadow root. */
	controls?: string

	attributeChangedCallback(name: string, old: string | null, value: string | null) {
		const field = FIELD[name]
		if (!field) return super.attributeChangedCallback(name, old, value)
		if (value === null) return
		this[field] = value
		this.removeAttribute(name)
	}
	protected updated(changed: Map<PropertyKey, unknown>) {
		super.updated(changed)
		// An id inside the shadow root would not find the page's element: the button refers to it directly.
		const inner = this.renderRoot.querySelector('button, a') as (HTMLElement & { ariaControlsElements?: Element[] | null }) | null
		if (inner && changed.has('controls') && 'ariaControlsElements' in inner) {
			const target = this.controls ? (this.getRootNode() as Document | ShadowRoot).getElementById?.(this.controls) : null
			inner.ariaControlsElements = target ? [target] : null
		}
	}

	private onClick() {
		if (this.inactive || this.href) return
		if (this.type === 'submit') this.form?.requestSubmit()
		else if (this.type === 'reset') this.form?.reset()
	}

	render() {
		const classes = [
			'inline-flex h-control-sm shrink-0 cursor-pointer items-center justify-center gap-1.5 border text-meta leading-5 font-medium whitespace-nowrap select-none',
			'transition-[color,background-color,border-color] duration-120 ease-standard',
			'disabled:cursor-not-allowed disabled:border-edge disabled:bg-surface-sunken disabled:text-fg-soft',
			'max-md:h-control-touch max-md:text-ui pointer-coarse:h-control-touch pointer-coarse:text-ui',
			this.icon ? 'w-control-sm px-0 max-md:w-control-touch pointer-coarse:w-control-touch' : 'px-2.5',
			this.press ? 'transition-[color,background-color,border-color,scale] ease-out active:enabled:scale-97 motion-reduce:active:enabled:scale-100' : '',
			VARIANTS[this.variant] ?? VARIANTS.secondary,
		].join(' ')
		return this.href
			? html`<a data-ds="button" part="control" href=${this.href} class=${classes} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} aria-expanded=${ifDefined(this.expanded)} aria-haspopup=${ifDefined(this.haspopup as never)}><slot></slot></a>`
			: html`<button data-ds="button" part="control" type="button" ?disabled=${this.inactive} class=${classes} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} aria-expanded=${ifDefined(this.expanded)} aria-haspopup=${ifDefined(this.haspopup as never)} @click=${this.onClick}><slot></slot></button>`
	}
}

define('button', Button)
