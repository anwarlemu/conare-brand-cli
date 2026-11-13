import { html } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/trend-arrow'
import styles from 'virtual:tw'

// ChartTrend.vue as <conare-chart-trend>: the week's change on a usage card (usage/Trend.vue, take 1, the one picked):
// a second stat on the card's right, This week over the percent with the pixel triangle, red up and ink down. `change`
// is a share (0.12 is 12%).

/** @summary The week's change: This week over the percent with a pixel triangle. */
export class ChartTrend extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { change: { type: Number }, label: {} }

	/** A share: 0.12 is 12%. */
	change = 0
	label = 'This week'

	render() {
		const down = this.change < 0
		const arrow = tag('trend-arrow')
		return html`<div data-ds="chart-trend" class="shrink-0 text-right" title="The last 7 days against the 7 before">
			<p class="type-meta text-fg-muted">${this.label}</p>
			<p class="flex items-center justify-end gap-1.5 text-heading-4 font-medium tabular-nums"><${arrow} ?down=${down} bare></${arrow}><span class="sr-only">${down ? 'down' : 'up'}</span>${`${Math.abs(Math.round(this.change * 100))}%`}</p>
		</div>`
	}
}

define('chart-trend', ChartTrend)
