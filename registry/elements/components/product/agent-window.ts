import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// AgentWindow.vue as <conare-agent-window>: the website's agent at work (HomeStepViz's last window), large, as the
// agents page opens it: the ask, what was added to context, then what the agent did, one under the other, in the dark
// code window. It plays once as it renders (the card settles in, each line rises 8px on its own beat, "Thinking"
// shimmers until it turns to "Worked for 1s"); reduced motion shows the end at once. The words come through
// attributes (Vue's `title` is `heading`); the `mark` slot replaces the brand mark.

/**
 * @summary An agent at work in the dark code window, played once.
 * @slot mark - Replaces the brand mark in the window's bar.
 */
export class AgentWindow extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, tag: {}, ask: {}, answer: {}, tool: {}, source: {} }

	/** The window's title (Vue's `title`). */
	heading = 'Your agent'
	tag = 'MCP'
	ask = 'How do refunds work?'
	answer = 'Refunds are available for 30 days.'
	tool = 'Search'
	source = 'Refunds'

	render() {
		return html`<div data-ds="agent-window" class="ds-agentwin w-full max-w-160" data-play>
			<div class="ds-agentwin-card">
				<div class="flex h-11 items-center gap-2 px-4 text-ui leading-4">
					<slot name="mark"><svg width="14" height="12" viewBox="0 0 149 134" fill="currentColor" class="h-3 w-auto shrink-0" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z"></path></svg></slot>
					<span class="truncate">${this.heading}</span>
					<span class="shrink-0 bg-ds-neutral-200 px-1.5 py-0.5 text-meta leading-4 text-code-fg tabular-nums">${this.tag}</span>
					<span class="ml-auto flex items-center gap-3 text-code-muted" aria-hidden="true">
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 7h8"></path></svg>
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 1h3v3M4 9H1V6M9 1 6 4M1 9l3-3"></path></svg>
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m1.5 1.5 7 7m0-7-7 7"></path></svg>
					</span>
				</div>
				<div class="grid grid-cols-1 gap-6 px-5 pt-2 pb-7">
					<div class="min-w-0">
						<p class="ds-agentwin-in bg-ds-neutral-200 px-3 py-2 text-body" style="--d: 200">${this.ask}</p>
						<p class="ds-agentwin-in ds-agentwin-note mt-2" style="--d: 600">
							<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"></rect><rect x="3" y="3" width="3" height="6" fill="currentColor"></rect></svg>
							<span class="text-code-fg">Conare</span> added to context
						</p>
					</div>
					<div class="flex min-w-0 flex-col gap-2">
						<p class="ds-agentwin-in ds-agentwin-note !grid" style="--d: 900">
							<span class="ds-agentwin-shimmer [grid-area:1/1]" style="--d: 2400">Thinking…</span>
							<span class="ds-agentwin-swap [grid-area:1/1]" style="--d: 2400">Worked for 1s</span>
						</p>
						<p class="ds-agentwin-in text-body leading-6" style="--d: 1300">Called <span class="ds-agentwin-chip">${this.tool}</span> in docs. ${this.answer}</p>
						<p class="ds-agentwin-in ds-agentwin-note" style="--d: 2600">Source <span class="ds-agentwin-chip text-code-fg"><span class="size-1.5 shrink-0 bg-surface-accent"></span>${this.source}</span></p>
					</div>
				</div>
			</div>
		</div>`
	}
}

define('agent-window', AgentWindow)
