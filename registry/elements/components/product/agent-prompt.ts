import { html, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { ChevronDown } from 'lucide'
import { styleMap } from 'lit/directives/style-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/product/agent-split'
import '@/elements/components/product/agent-window'
import '@/elements/components/ui/code-pop'
import '@/elements/components/visuals/cell-burst'
import '@/elements/components/visuals/grain'
import type { Install } from '@/elements/components/product/agent-split'
import styles from 'virtual:tw'

// AgentPrompt.vue as <conare-agent-prompt>: connect a coding agent over MCP (the console's agents/Connect.vue): one
// column in the double-rule frame. The agent at work, large, on the dark panel with its grain and a sheet of cells;
// then the heading with its red stop, the prompt in a paper box that shows its first lines and opens the rest in place
// (Show all: to its height in 200ms, back in 140ms, from wherever it is), and under it Copy prompt with the one-click
// installs, and the API call opening from its own button. The agent signs in with OAuth, so no key is shown. The
// prompt and the request keep their line breaks, so set them as properties; `installs` is a JSON attribute or a
// property; Vue's `title` is `heading`.

/**
 * @summary Connect a coding agent: the agent at work, the prompt, Copy prompt and the API call.
 * @fires copied - The prompt was copied.
 * @fires install - An install was chosen; detail.value is its label.
 */
export class AgentPrompt extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { prompt: {}, code: {}, installs: { type: Array }, heading: {}, all: { state: true } }

	prompt = ''
	code = ''
	installs: Install[] = []
	/** The heading over the prompt (Vue's `title`). */
	heading = 'Give this prompt into your agent'
	private all = false
	private textId = uid('agent-prompt')
	private from: number | null = null

	private get box() {
		return this.renderRoot.querySelector<HTMLElement>('.ds-promptbox-text')
	}
	// Vue measures before the flip and after the next render (nextTick), then animates the height between.
	private toggle() {
		const el = this.box
		this.from = el?.offsetHeight ?? 0
		el?.getAnimations().forEach((a) => a.cancel())
		this.all = !this.all
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const el = this.box
		const start = this.from
		this.from = null
		if (start === null || !el) return
		const to = el.offsetHeight
		if (to === start || matchMedia('(prefers-reduced-motion: reduce)').matches) return
		const easing = getComputedStyle(el).getPropertyValue('--ds-easing-out').trim() || 'ease-out'
		el.animate([{ height: `${start}px` }, { height: `${to}px` }], { duration: this.all ? 200 : 140, easing })
	}

	render() {
		// A wrapped line hangs past its indent and its list mark, so the steps still read as steps.
		const lines = this.prompt.split('\n').map((line) => {
			const text = line.trimStart()
			return { text, at: line.length - text.length, mark: /^(?:- |\d+\. )/.exec(text)?.[0].length ?? 0 }
		})
		const id = this.textId
		const all = this.all
		const [grain, burst, win, split, pop] = ['grain', 'cell-burst', 'agent-window', 'agent-split', 'code-pop'].map(tag)
		return staticHtml`<div data-ds="agent-prompt" class="ds-agentstep">
			<section class="ds-agentwork" aria-labelledby=${`${id}-title`}>
				<div class="ds-agentwork-panel" aria-hidden="true">
					<${grain}></${grain}>
					<div class="pointer-events-none absolute inset-0 opacity-70"><${burst} seed="17"></${burst}></div>
					<div class="relative flex w-full justify-center px-4 py-8"><${win}></${win}></div>
				</div>
				<div class="ds-agentwork-card">
					<h2 id=${`${id}-title`} class="type-heading-2 text-balance">${this.heading}<span class="text-fg-accent-display">.</span></h2>
					<div class="ds-promptbox">
						<div id=${id} class="ds-promptbox-text" data-all=${ifDefined(all ? 'true' : undefined)}>
							<pre>${lines.map((l) => html`<span style=${styleMap({ '--at': String(l.at), '--mark': String(l.mark) })}>${l.text}</span>`)}</pre>
						</div>
						<div class="ds-promptbox-foot">
							<button type="button" class="ds-promptbox-more" aria-expanded=${String(all)} aria-controls=${id} @click=${this.toggle}>
								<span class="ds-promptbox-stack"><span data-on=${ifDefined(!all ? 'true' : undefined)} aria-hidden=${String(all)}>Show all</span><span data-on=${ifDefined(all ? 'true' : undefined)} aria-hidden=${String(!all)}>Show less</span></span>
								${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'ds-promptbox-chev', attrs: { 'aria-hidden': 'true' } })}
							</button>
						</div>
					</div>
					<div class="ds-agentwork-act">
						<${split} .prompt=${this.prompt} .installs=${this.installs} large @copied=${(e: Event) => { e.stopPropagation(); this.emit('copied') }} @install=${(e: CustomEvent<{ value: string }>) => { e.stopPropagation(); this.emit('install', { value: e.detail.value }) }}></${split}>
						<${pop} .code=${this.code} label="API call" heading="Search from your code" large></${pop}>
					</div>
				</div>
			</section>
		</div>`
	}
}

define('agent-prompt', AgentPrompt)
