import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import { citeParts } from '@/elements/controllers/search-results'
import styles from 'virtual:tw'

// AnswerText.vue as <conare-answer-text>: a written answer's words at 16px with its sources as small ink squares, [1]
// and [2] in the text becoming numbered buttons (console2.css .v2-written-text, .v2-cite). A citation turns red under
// the pointer and while it is the one shown (`pointed`). The words rise in once, a blur clearing (.v2-answer-in).

/**
 * @summary A written answer, its sources as small numbered buttons.
 * @fires cite - A citation was pressed; detail { n }.
 * @fires point - A citation is under the pointer or focus; detail { n }.
 */
export class AnswerText extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { text: {}, pointed: { type: Number } }

	/** The answer, its sources as [1], [2]. */
	text = ''
	/** The citation shown. */
	pointed?: number

	render() {
		return html`<p data-ds="answer-text" class="ds-answer-text">${citeParts(this.text ?? '').map((p) => ('cite' in p
			? html`<button type="button" class="ds-cite" aria-label=${`Source ${p.cite}`} aria-pressed=${ifDefined(this.pointed === undefined ? undefined : String(this.pointed === p.cite))} @pointerenter=${() => this.emit('point', { n: p.cite })} @focus=${() => this.emit('point', { n: p.cite })} @click=${() => this.emit('cite', { n: p.cite })}>${p.cite}</button>`
			: p.words))}</p>`
	}
}

define('answer-text', AnswerText)
