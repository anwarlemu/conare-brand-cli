import { type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Check } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { PixelGridController, vars } from '@/elements/controllers/pixel-grid'
import '@/elements/components/ui/count'
import '@/elements/components/ui/dot-matrix'
import styles from 'virtual:tw'

// FixButton.vue as <conare-fix-button>: the one button a fix needs, which then reports the fix itself, so the eye stays
// where it pressed (namespaces/FixButton.vue, console2.css .v2-fixbtn, .v2-states). At rest it is the website's dark
// button: on hover its red squares run across under the label. A press answers on pointer-down (scale 0.97) and fires
// `press`; the app then moves `state` along: signing (signing in), catching (the changes coming back, counted as they
// arrive), done (a check draws itself and the last count stays as the result). Every state is stacked in one cell, so
// nothing around it moves: labels leave up and arrive from below with a touch of blur. Once the source is back the
// black wipes off left to right on the strong ease-out (420ms), and since the label is printed on both layers it changes
// colour exactly at the edge. `tone="red"` is the same button the other way round (red, its squares running black), for
// a calm page. It is a rare action, so it may take a moment. Reduced motion keeps the fades only.
export type FixState = 'broken' | 'signing' | 'catching' | 'done'
const STEP: Record<FixState, number> = { broken: 0, signing: 1, catching: 2, done: 3 }
const plain = (n: number) => n.toLocaleString('en-US')

/**
 * @summary The button a fix needs, which then reports the fix in place.
 * @fires press - It was pressed (move `state` along from here).
 */
export class FixButton extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { state: {}, app: {}, count: { type: Number }, tone: {}, pulled: { state: true } }

	/** broken, signing, catching or done. */
	state: FixState = 'broken'
	/** The app to reconnect. */
	app = ''
	/** The changes that came back. */
	count = 0
	/** red: the button the other way round. */
	tone?: 'red'
	private pulled = 0

	private grid = new PixelGridController(this, () => this.renderRoot.querySelector<HTMLElement>('.ds-fix'))

	protected willUpdate(changed: PropertyValues) {
		if (!this.hasUpdated) this.pulled = this.count
		else if (changed.has('count') && this.count) this.pulled = this.count
	}

	render() {
		const g = this.grid.grid
		const app = this.app
		const spoken = ({ broken: `Reconnect ${app}`, signing: `Signing in to ${app}`, catching: `${app} is syncing`, done: `${app} is up to date` })[this.state]
		const dots = tag('dot-matrix')
		const count = tag('count')
		const layer = (name: 'text' | 'ink') => html`<span class=${`ds-states ds-fix-${name}`} aria-hidden="true">${name === 'ink' && g ? html`<span class="ds-fix-fill" style=${this.grid.style}>${g.cells.map((c) => html`<i style=${vars(c)}></i>`)}</span>` : ''}<span style="--n: 0">${`Reconnect ${app}`}</span><span style="--n: 1"><${dots} tone=${name === 'ink' ? 'inverse' : 'default'}></${dots}>Signing in</span><span style="--n: 2"><${dots} tone=${name === 'ink' ? 'inverse' : 'default'}></${dots}><${count} .value=${this.pulled}></${count}> changes</span><span style="--n: 3">${icon(Check, 'check', { size: 12, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } })}${`${plain(this.pulled)} changes`}</span></span>`
		return html`<button data-ds="fix-button" type="button" class="ds-fix" data-state=${this.state} data-tone=${ifDefined(this.tone)} style=${`--s: ${STEP[this.state] ?? 0}`} ?disabled=${this.state !== 'broken'} aria-busy=${String(this.state === 'signing' || this.state === 'catching')} aria-label=${spoken} @click=${(e: Event) => { e.stopPropagation(); this.emit('press') }}>${layer('text')}${layer('ink')}</button>`
	}
}

define('fix-button', FixButton)
