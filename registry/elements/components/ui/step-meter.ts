import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// StepMeter.vue as <conare-step-meter>: steps as squares (SetupMeter.vue, after the overview's pixel meters): 6px
// squares 2px apart, done steps ink, the next one red, the rest an empty hairline. A picture: put the words beside it
// ("2 of 4 done"). `steps` is a JSON attribute (steps='[true,true,false,false]') or a property.

/** @summary Steps as squares. */
export class StepMeter extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { steps: { type: Array } }

	steps: boolean[] = []

	render() {
		const next = this.steps.findIndex((f) => !f)
		return html`<span data-ds="step-meter" class="inline-flex gap-0.5" aria-hidden="true">${this.steps.map((done, i) => html`<i class=${['size-1.5 border', done ? 'border-surface-inverse bg-surface-inverse' : i === next ? 'border-edge-accent bg-edge-accent' : 'border-edge-strong'].join(' ')}></i>`)}</span>`
	}
}

define('step-meter', StepMeter)
