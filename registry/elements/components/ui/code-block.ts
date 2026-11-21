import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/code-copy'
import styles from 'virtual:tw'

// CodeBlock.vue as <conare-code-block>: code to read and copy (the console's CodeWindow.vue), one dark window on the
// site and in the product: a pill for each request or language and Copy on one row, a rule, then the code in 12px Geist
// Mono. There is always a pill: one names the code (`label`, else cURL for a curl command, else Shell), several pick it
// (`samples`). Copy takes all of it. Code reads left to right in every language. The host is the window (code-block.css),
// so a class on <conare-code-block> (a margin, as CodePop and DocsBlocks give it) lands on it as on Vue's root.

/**
 * @summary A dark code window: a pill per language, Copy, then the code.
 * @fires copied - The code is on the clipboard.
 */
export class CodeBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { code: {}, label: {}, samples: { type: Array }, picked: { state: true } }

	/** One piece of code. */
	code?: string
	/** The pill's name for `code`, or the tab list's name for `samples`. */
	label?: string
	/** [{ label, code }]: a pill for each. */
	samples?: { label: string, code: string }[]
	private picked = 0

	connectedCallback() {
		super.connectedCallback()
		// Code reads left to right in every language.
		if (!this.hasAttribute('dir')) this.setAttribute('dir', 'ltr')
	}

	render() {
		const tabs = this.samples?.map((s) => s.label) ?? [this.label ?? (this.code?.startsWith('curl') ? 'cURL' : 'Shell')]
		const shown = this.samples?.[this.picked]?.code ?? this.code ?? ''
		const copy = tag('code-copy')
		return html`<div class="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-[color-mix(in_srgb,var(--ds-color-off-white)_24%,transparent)] p-2">
				${tabs.length > 1
					? html`<div class="flex min-w-0 flex-wrap gap-0.5" role="tablist" aria-label=${this.label ?? 'code'}>${tabs.map((t, i) => html`<button
							type="button"
							role="tab"
							aria-selected=${String(this.picked === i)}
							class="inline-flex h-control-sm cursor-pointer items-center px-2.5 text-meta leading-5 font-medium text-code-muted transition-[color,background-color] duration-120 ease-standard hover:text-code-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface-accent aria-selected:bg-code-raised aria-selected:text-code-fg"
							@click=${() => { this.picked = i }}
						>${t}</button>`)}</div>`
					: html`<div class="flex min-w-0"><span class="inline-flex h-control-sm min-w-0 items-center bg-code-raised px-2.5 text-meta leading-5 font-medium text-code-fg [overflow-wrap:anywhere]">${tabs[0]}</span></div>`}
				${staticHtml`<${copy} .text=${shown}></${copy}>`}
			</div>
			<pre tabindex="0" aria-label=${`${tabs[this.samples ? this.picked : 0] ?? 'code'}, code`} class="fade-x m-0 overflow-x-auto px-4 py-3 type-code-sm leading-5 whitespace-pre focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface-accent">${shown}</pre>`
	}
}

define('code-block', CodeBlock)
