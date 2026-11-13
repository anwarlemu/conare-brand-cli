import { LitElement, type CSSResultGroup, type PropertyDeclarations, type PropertyValues } from 'lit'
import { literal, unsafeStatic, type StaticValue } from 'lit/static-html.js'
import base from 'virtual:ds-base'
import properties from 'virtual:ds-properties'

// The base every element builds on. Its shadow root gets the shared base sheet (Tailwind's preflight and the brand's
// element defaults: hairline borders, the focus ring, selection), and the element adds its own sheet, compiled at
// build time from the classes in its file (`import styles from 'virtual:tw'`). Tokens arrive through the inherited
// --ds-* variables, so brand.css on the page and [data-theme="dark"] on an ancestor reach inside.
//
// The host carries data-ds="<name>", so a page with the brand's scoped base gives it the body's type, as a Vue
// component's root gets it. By default the host is display: contents and the shadow's root element is the box; an
// element whose root takes classes from the page (layout, width) styles :host instead (see PORTING.md).

declare const __DS_PREFIX__: string
/** The brand's tag prefix (brand.json elementPrefix), set at build time. */
export const PREFIX: string = typeof __DS_PREFIX__ === 'string' ? __DS_PREFIX__ : 'ds'
/** `<prefix>-<name>`. */
export const tagName = (name: string) => `${PREFIX}-${name}`
/** A tag for lit/static-html templates: html`<${tag('menu-item')}>...</${tag('menu-item')}>`. */
export const tag = (name: string): StaticValue => unsafeStatic(tagName(name))
export { literal }

// Tailwind registers its own custom properties (--tw-translate-x...) with @property, which a shadow root ignores; they
// are registered once on the document instead, so transforms and rings resolve inside every element.
let registered = false
function registerProperties() {
	if (registered || !('CSS' in globalThis) || !CSS.registerProperty) return
	registered = true
	for (const p of properties) {
		try {
			CSS.registerProperty(p)
		} catch {
			// Already registered (the page's own Tailwind, or another copy of the library).
		}
	}
}

export class DsElement extends LitElement {
	/** The registry name of this element's component (button, pixel-button), written to the host's data-ds. */
	static dsName = ''
	static styles: CSSResultGroup = [base]

	constructor() {
		super()
		registerProperties()
	}

	connectedCallback() {
		super.connectedCallback()
		const name = (this.constructor as typeof DsElement).dsName
		if (name && !this.hasAttribute('data-ds')) this.setAttribute('data-ds', name)
	}

	/** Dispatches a composed, bubbling event: `emit('confirm')`, `emit('select', { value })`. */
	emit<T>(type: string, detail?: T, options: { cancelable?: boolean } = {}) {
		return this.dispatchEvent(new CustomEvent<T>(type, { detail, bubbles: true, composed: true, cancelable: options.cancelable }))
	}

	/** v-model: sets `value` and dispatches `input` and `change`, as a native field does. */
	commit(value: unknown, key = 'value') {
		;(this as unknown as Record<string, unknown>)[key] = value
		// A value or a checked state is what a form control changes: the native input and change events, as an <input>.
		if (key === 'value' || key === 'checked') {
			this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
			this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
		}
		if (key !== 'value') this.emit(`${key}-change`, { value })
	}

	/** Whether a slot has content (Vue's `$slots.name`). Call from render; slotchange re-renders. */
	hasSlot(name = '') {
		return [...this.childNodes].some((n) => (name ? n instanceof Element && n.getAttribute('slot') === name : (n instanceof Element && !n.hasAttribute('slot')) || (n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim())))
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		// Slots that come and go change what the element draws ($slots), so it renders again when they do.
		this.renderRoot.addEventListener('slotchange', () => this.requestUpdate())
	}
}

/** Defines `<prefix>-<name>` once (a second copy of a module on the page is harmless). */
export function define(name: string, element: CustomElementConstructor & { dsName?: string }) {
	// Its own name, also for a subclass (<conare-select> extends <conare-combobox>).
	if (!Object.prototype.hasOwnProperty.call(element, 'dsName') || !element.dsName) element.dsName = name
	const t = tagName(name)
	if (!customElements.get(t)) customElements.define(t, element)
}

/**
 * A form-associated element (ElementInternals): it takes part in its <form> (value, reset, disabled from a fieldset)
 * and a <label for> names it. Subclasses call `this.internals.setFormValue(...)` when their value changes.
 */
export class DsFormElement extends DsElement {
	static formAssociated = true
	readonly internals: ElementInternals
	constructor() {
		super()
		this.internals = this.attachInternals()
	}
	get form() {
		return this.internals.form
	}
	static properties: PropertyDeclarations = { formDisabled: { state: true } }
	/** A disabled fieldset around it; its own `disabled` stays as it was set. */
	formDisabled = false
	formDisabledCallback(disabled: boolean) {
		this.formDisabled = disabled
	}
	/** Disabled by itself or by its fieldset: what render and handlers read. */
	get inactive() {
		return !!(this as unknown as { disabled?: boolean }).disabled || this.formDisabled
	}
}

/** Light-DOM id for a part, unique per page (Vue's useId). */
let ids = 0
export const uid = (prefix: string) => `${prefix}-${PREFIX}${++ids}`
