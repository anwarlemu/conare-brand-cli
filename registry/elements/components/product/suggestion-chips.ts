import { html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Search } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// SuggestionChips.vue as <conare-suggestion-chips>: questions to start from under the search box (search/SuggestChips.vue,
// the picked take 3): each chip ends on a mono tag for the namespace that answers it, with the app's 10px mark when
// there is one. A paper block glides between the chips under the pointer or focus (160ms on the console's curve, placed
// without a glide the first time) and fades when the pointer leaves; the tag under it goes a shade darker, never
// lighter. Picking one fires `ask`.
export interface Suggestion { q: string, ns: string, logo?: string }

/**
 * @summary Questions to start from, each ending on the namespace that answers it.
 * @fires ask - A chip was picked; detail is the suggestion { q, ns, logo }.
 */
export class SuggestionChips extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { items: { type: Array }, label: {}, shown: { state: true }, instant: { state: true }, mark: { state: true } }

	/** [{ q, ns, logo? }]. */
	items: Suggestion[] = []
	/** The group's name. */
	label?: string
	private shown = false
	private instant = true
	private mark = { x: 0, y: 0, w: 0, h: 0 }

	private glide(event: Event) {
		const el = event.currentTarget as HTMLElement
		this.instant = !this.shown
		this.shown = true
		this.mark = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }
	}

	render() {
		const m = this.mark
		const glide = (e: Event) => this.glide(e)
		const hide = () => { this.shown = false }
		return html`<div data-ds="suggestion-chips" class="relative flex flex-wrap justify-center gap-2" role="group" aria-label=${this.label ?? 'suggested searches'} @pointerleave=${hide}>
			<span class="ds-chipmark" data-shown=${ifDefined(this.shown ? '' : undefined)} data-instant=${ifDefined(this.instant ? '' : undefined)} style=${`transform: translate(${m.x}px, ${m.y}px); width: ${m.w}px; height: ${m.h}px`} aria-hidden="true"></span>
			${repeat(this.items ?? [], (s) => s.q, (s) => html`<button type="button" class="ds-sgchip" @pointerenter=${glide} @focus=${glide} @blur=${hide} @click=${() => this.emit('ask', s)}>
				${icon(Search, 'search', { size: 12, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}
				<span class="min-w-0">${s.q}</span>
				<span class="ds-sgtag"><span class="sr-only">in</span>${s.logo ? html`<img src=${s.logo} alt="" width="10" height="10" class="size-2.5 object-contain">` : nothing}${s.ns}</span>
			</button>`)}
		</div>`
	}
}

define('suggestion-chips', SuggestionChips)
