import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Meter.vue as <conare-meter>: progress as a bar (console2.css .v2-meter): a 4px hairline-grey track with an ink fill.
// `tone="top"` fills it red, for the largest share in a list (the bill's amounts); `tone="rest"` in neutral-500, for
// what the rest add up to. `label` names it for screen readers (role meter); `decorative` hides it when the row's text
// already says it, such as a share bar in a table. `live` eases the fill linearly as the value moves (a job's
// progress), on transform from the left, still for reduced motion.

const FILL = { default: 'bg-surface-inverse', top: 'bg-edge-accent', rest: 'bg-ds-neutral-500' }

/** @summary Progress as a bar. */
export class Meter extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: { type: Number }, max: { type: Number }, label: {}, tone: {}, decorative: { type: Boolean }, live: { type: Boolean } }

	value = 0
	max = 100
	/** The name for assistive tech. */
	label?: string
	tone: 'default' | 'top' | 'rest' = 'default'
	/** Hidden from assistive tech (the row's text says it). */
	decorative = false
	/** Ease the fill as the value moves. */
	live = false

	render() {
		const share = Math.max(0, Math.min(1, this.value / (this.max || 1)))
		const d = this.decorative
		return html`<div data-ds="meter" class="block h-1 bg-edge" role=${ifDefined(d ? undefined : 'meter')} aria-hidden=${ifDefined(d ? 'true' : undefined)} aria-label=${ifDefined(d ? undefined : this.label)} aria-valuemin=${ifDefined(d ? undefined : '0')} aria-valuemax=${ifDefined(d ? undefined : String(this.max))} aria-valuenow=${ifDefined(d ? undefined : String(this.value))}><span class=${['block h-full', FILL[this.tone] ?? FILL.default, this.live ? 'ds-meter-live' : ''].join(' ')} style=${styleMap(this.live ? { transform: `scaleX(${share})` } : { width: `${share * 100}%` })}></span></div>`
	}
}

define('meter', Meter)
