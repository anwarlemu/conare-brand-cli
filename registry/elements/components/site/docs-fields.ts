import { nothing } from 'lit'
import { html } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/site/docs-inline'
import styles from 'virtual:tw'

// DocsFields.vue as <conare-docs-fields>: an endpoint's parameters or fields (docs/Fields.vue), one ruled row each: the
// name in the mono, its type and "required" or its default beside it, then what it is and its limits. A field's own
// fields sit under it behind a toggle, in the same rows a step in; the toggle's plus turns to a minus when open.
export type DocsField = { name: string, type: string, required?: boolean, default?: string, text?: string, notes?: string[], children?: DocsField[] }

/** @summary An endpoint's fields, one ruled row each, nested fields behind a toggle. */
export class DocsFields extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { fields: { type: Array }, nested: { type: Boolean, reflect: true } }

	/** [{ name, type, required?, default?, text?, notes?, children? }]. */
	fields: DocsField[] = []
	/** A field's own fields: ruled at the start and stepped in. */
	nested = false

	render() {
		const inline = tag('docs-inline')
		const fields = tag('docs-fields')
		return html`<ul class="ds-docs-params contents">${repeat(this.fields ?? [], (f) => f.name, (f) => html`<li class="py-4">
			<p class="flex flex-wrap items-center gap-x-2 gap-y-1 type-code" dir="ltr">
				<span class="font-medium text-fg">${f.name}</span>
				<span class="ds-docs-tag">${f.type}</span>
				${f.required ? html`<span class="ds-docs-tag" data-required>required</span>` : nothing}
				${f.default !== undefined ? html`<span class="ds-docs-tag">${`default: ${f.default}`}</span>` : nothing}
			</p>
			${f.text ? html`<p class="mt-2 type-body-lg text-fg-muted"><${inline} .text=${f.text}></${inline}></p>` : nothing}
			${(f.notes ?? []).map((n) => html`<p class="mt-1.5 type-ui text-fg-muted"><${inline} .text=${n}></${inline}></p>`)}
			${f.children
				? html`<details class="ds-docs-more mt-3">
						<summary class="ds-docs-btn inline-flex h-7 cursor-pointer list-none items-center gap-1.5 px-2.5 text-meta leading-4">
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" class="ds-docs-sign"><path d="M5 1.5v7M1.5 5h7"></path></svg>
							${`${f.children.length} ${f.children.length === 1 ? 'field' : 'fields'}`}
						</summary>
						<${fields} .fields=${f.children} nested class="mt-2"></${fields}>
					</details>`
				: nothing}
		</li>`)}</ul>`
	}
}

define('docs-fields', DocsFields)
