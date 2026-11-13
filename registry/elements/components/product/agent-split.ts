import { html, nothing, type PropertyValues } from 'lit'
import { ArrowUpRight, Check, ChevronDown, Copy } from 'lucide'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { CopyController } from '@/elements/controllers/copy'
import { PixelGridController, vars } from '@/elements/controllers/pixel-grid'
import styles from 'virtual:tw'

// AgentSplit.vue as <conare-agent-split>: connect your agent's split button (the console's agent/Split.vue, take 2, the
// pick): one black block, Copy prompt and a narrower arrow inside it with no divider. One prompt carries every client's
// setup, so the arrow holds only what the prompt can't do: the one-click installs (`installs`, a JSON attribute or a
// property). The halves act as one button: under the pointer, or once copied, the red squares run across the copy and
// on into the arrow. The menu opens under it at its width, dark. `large` is the 36px size with the grain.
//
// The halves light as one through one stylesheet, which cannot reach into another element's shadow root, so the copy
// half is PixelButton's markup drawn here (data-ds="pixel-button", its <style> in agent-split.css) and the menu's rows
// are MenuItem's (data-ds="menu-item"), as the Vue component renders them. The menu keys are useMenu's.

export interface Install { label: string, href: string }

// The arrow's squares start where the copy's end (their delays run 70 to 112ms), so the red crosses into it.
let seed = 29
const rand = () => {
	seed = (seed * 16807) % 2147483647
	return (seed - 1) / 2147483646
}
const ARROW = Array.from({ length: 49 }, (_, k) => ({ '--i': String(Math.round(70 + ((k % 7) / 7) * 30 + rand() * 12)), '--o': String(Math.round(60 + ((k % 7) / 7) * 30 + rand() * 12)) }))

/**
 * @summary Copy prompt and the one-click installs, as one black split button.
 * @fires copied - The prompt was copied.
 * @fires install - An install was chosen; detail.value is its label.
 */
export class AgentSplit extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { prompt: {}, installs: { type: Array }, large: { type: Boolean }, open: { state: true } }

	prompt = ''
	installs: Install[] = []
	/** The 36px size with the grain. */
	large = false
	private open = false
	private pending: 'first' | 'last' | 'none' | null = null
	private menuId = uid('agent-menu')
	private copier = new CopyController(this)
	private grid = new PixelGridController(this, () => this.renderRoot.querySelector<HTMLElement>('.ds-px'))

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('pointerdown', this.outside)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('pointerdown', this.outside)
	}
	private outside = (event: PointerEvent) => {
		if (this.open && !event.composedPath().includes(this)) this.open = false
	}

	private async put() {
		if (await this.copier.copy(this.prompt)) this.emit('copied')
	}

	// useMenu: it opens on click, arrows move between rows (opening on their end of the list from the button), Home
	// and End jump, Escape closes and returns focus to the button, Tab and a press outside close it.
	private rows() {
		return [...this.renderRoot.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])')]
	}
	private show(focus: 'first' | 'last' | 'none' = 'first') {
		this.pending = focus
		this.open = true
		// Already open, the state does not change: render anyway, so the row asked for takes focus (as Vue's nextTick).
		this.requestUpdate()
	}
	private close(refocus = false) {
		this.open = false
		if (refocus) this.renderRoot.querySelector<HTMLElement>('.ds-split-arrow')?.focus()
	}
	private toggle = () => {
		if (this.open) this.close()
		else this.show('none')
	}
	private onTriggerKey = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			this.show(event.key === 'ArrowDown' ? 'first' : 'last')
		} else if (event.key === 'Escape' && this.open) {
			event.preventDefault()
			this.close(true)
		}
	}
	private onMenuKey = (event: KeyboardEvent) => {
		const list = this.rows()
		const at = list.indexOf(this.shadowRoot?.activeElement as HTMLElement)
		if (event.key === 'Escape') {
			event.preventDefault()
			this.close(true)
		} else if (event.key === 'Tab') {
			// The browser moves focus first, from the row to what follows it, as it does in Vue; removed before that, the
			// row would leave focus at the start of this element.
			setTimeout(() => this.close())
		}
		else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			const step = event.key === 'ArrowDown' ? 1 : -1
			list[(at + step + list.length) % list.length]?.focus()
		} else if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault()
			;(event.key === 'Home' ? list[0] : list.at(-1))?.focus()
		}
	}
	private choose(label: string) {
		this.emit('install', { value: label })
		this.close(true)
	}

	// After the menu renders: bring it into view and focus the row asked for (Vue's nextTick).
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!this.open || !this.pending) return
		const focus = this.pending
		this.pending = null
		this.renderRoot.querySelector('[role="menu"]')?.scrollIntoView({ block: 'nearest' })
		if (focus === 'none') return
		const list = this.rows()
		;(focus === 'last' ? list.at(-1) : list[0])?.focus()
	}

	render() {
		const copied = this.copier.copied
		const g = this.grid.grid
		const on = (v: boolean) => (v ? 'true' : undefined)
		return html`<div data-ds="agent-split" class="ds-split" data-done=${ifDefined(on(copied))} data-large=${ifDefined(on(this.large))}>
			<button data-ds="pixel-button" type="button" class="ds-px ds-split-copy" data-done=${ifDefined(on(copied))} data-large=${ifDefined(on(this.large))} @click=${this.put}>${g ? html`<span aria-hidden="true" class="ds-px-fill" style=${this.grid.style}>${g.cells.map((c) => html`<i style=${vars(c)}></i>`)}</span>` : nothing}<span class="ds-px-label"><span class="ds-split-swap" data-on=${ifDefined(on(copied))}>
					<span class="ds-split-swap-a">${icon(Copy, 'copy', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Copy prompt</span>
					<span class="ds-split-swap-b" aria-hidden="true">${icon(Check, 'check', { size: 12, strokeWidth: 2 })}Copied</span>
				</span></span></button>
			${this.installs?.length
				? html`<button type="button" class="ds-split-arrow" aria-haspopup="menu" aria-expanded=${String(this.open)} aria-controls=${this.menuId} aria-label="other ways to connect" @click=${this.toggle} @keydown=${this.onTriggerKey}>
						<span aria-hidden="true" class="ds-split-fill">${ARROW.map((c) => html`<i style=${styleMap(c)}></i>`)}</span>
						${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'ds-split-chev' })}
					</button>`
				: nothing}
			${this.open
				? html`<div id=${this.menuId} class="ds-split-menu" role="menu" aria-label="connect your agent" @keydown=${this.onMenuKey}>${this.installs.map((i) => html`<a data-ds="menu-item" href=${i.href} role="menuitem" class="ds-menu-item" @click=${() => this.choose(i.label)}><span class="flex-1">${i.label}</span>${icon(ArrowUpRight, 'arrow-up-right', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</a>`)}</div>`
				: nothing}
			<span class="sr-only" aria-live="polite">${copied ? 'prompt copied' : ''}</span>
		</div>`
	}
}

define('agent-split', AgentSplit)
