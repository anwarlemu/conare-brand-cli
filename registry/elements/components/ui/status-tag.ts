import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { Tag } from '@/elements/components/ui/tag'
import '@/elements/components/ui/dot-matrix'
import styles from 'virtual:tw'

// StatusTag.vue as <conare-status-tag>: a source's state as a tag (the console's Status.vue): ready in a hairline,
// syncing and connecting in black with the dot matrix at work, error in the red wash with its square. Red marks only a
// failure. It is a <conare-tag> whose tone and word come from `status`.

/**
 * @summary A source's state as a tag.
 */
export class StatusTag extends Tag {
	static styles = [Tag.styles, styles]
	static properties = { ...Tag.properties, status: {} }

	/** ready, syncing, connecting or error (any other word shows as it is, in a hairline). */
	status = ''

	get working() {
		return this.status === 'syncing' || this.status === 'connecting'
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		this.tone = this.status === 'error' ? 'failed' : this.working ? 'working' : 'default'
	}

	protected renderMark() {
		if (this.working) return staticHtml`<${tag('dot-matrix')} tone="inverse" class="mt-0.5 mr-0.5"></${tag('dot-matrix')}>`
		return this.tone === 'failed' ? html`<span class="mt-0.5 size-1 shrink-0 bg-edge-accent" aria-hidden="true"></span>` : nothing
	}
	protected renderLabel() {
		return this.status
	}
}

define('status-tag', StatusTag)
