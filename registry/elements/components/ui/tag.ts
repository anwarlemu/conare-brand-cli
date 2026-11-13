import { html, nothing, type TemplateResult } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Tag.vue as <conare-tag>: a short label for a state or a kind (console2.css .c-badge under the console): 18px,
// square, 11px lowercase words. default: a hairline in ink; working: black, for a source at work; failed: the red wash
// with a red square; quiet: a hairline in the muted grey, for a note such as "default" or "invited". The word carries
// the state, never colour alone.
export type TagTone = 'default' | 'working' | 'failed' | 'quiet'
const TONES: Record<TagTone, string> = {
	default: 'border-edge text-fg',
	working: 'border-status-working bg-status-working text-status-working-fg',
	failed: 'border-transparent bg-status-failed text-status-failed-fg',
	quiet: 'border-edge text-fg-muted',
}

/**
 * @summary A short label for a state or a kind.
 * @slot - The word.
 * @slot mark - What leads the word; by default a red square on `failed`.
 */
export class Tag extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { tone: {} }

	tone: TagTone = 'default'

	/** What leads the word: the `mark` slot, a red square on `failed` by default. */
	protected renderMark(): TemplateResult | typeof nothing {
		return html`<slot name="mark">${this.tone === 'failed' ? html`<span class="mt-0.5 size-1 shrink-0 bg-edge-accent" aria-hidden="true"></span>` : nothing}</slot>`
	}
	/** The word. */
	protected renderLabel(): TemplateResult | string {
		return html`<slot></slot>`
	}

	render() {
		const name = (this.constructor as typeof DsElement).dsName
		return html`<span data-ds="${name}" class=${['inline-flex h-4.5 items-center gap-1 border px-1.25 pb-0.5 text-caption leading-4 font-normal whitespace-nowrap', TONES[this.tone] ?? TONES.default].join(' ')}>${this.renderMark()}${this.renderLabel()}</span>`
	}
}

define('tag', Tag)
