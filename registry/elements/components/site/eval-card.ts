import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// EvalCard.vue as <conare-eval-card>: a benchmark as a card (the evals page and a model's page): its name, our score
// and rank, the top rows as bars, ours in red and kept in (in the last place) when it falls outside them, and the way
// to its page. The paper comes in under the pointer. Every figure comes through properties (`rank` and `rows` as JSON
// attributes or properties); `better` sorts the rows by its own direction.
export type EvalRow = { name: string, value: number, ours?: boolean, rank?: number }

/**
 * @summary A benchmark as a card: score, rank and the top rows as bars.
 */
export class EvalCard extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		href: {},
		name: {},
		metric: {},
		score: { type: Number },
		rank: { type: Object },
		rows: { type: Array },
		max: { type: Number },
		better: {},
		unit: {},
		limit: { type: Number },
		linkLabel: { attribute: 'link-label' },
	}

	/** The benchmark's page. */
	href = ''
	/** The benchmark. */
	name = ''
	metric = ''
	/** Our score. */
	score = 0
	/** Where ours ranks: { n, of, word? }. */
	rank: { n: number, of: number, word?: string } = { n: 1, of: 1 }
	rows: EvalRow[] = []
	/** The value a full bar stands for. */
	max = 100
	better: 'higher' | 'lower' = 'higher'
	unit?: '%'
	/** How many rows show. */
	limit = 5
	linkLabel = 'See the benchmark'

	private format(value: number) {
		return this.unit === '%' ? `${value.toFixed(1)}%` : value.toFixed(1)
	}

	render() {
		const rank = this.rank
		const rankLabel = `#${rank.n} of ${rank.of}${rank.word ? `, ${rank.word}` : ''}`
		const sorted = [...this.rows].sort((a, b) => (this.better === 'higher' ? b.value - a.value : a.value - b.value))
		let picked = sorted
		if (this.limit && sorted.length > this.limit) {
			picked = sorted.slice(0, this.limit)
			const ours = sorted.find((r) => r.ours)
			if (ours && !picked.some((r) => r.ours)) picked = [...picked.slice(0, this.limit - 1), ours]
		}
		return html`<a data-ds="eval-card" href=${this.href} class="ds-eval-card flex w-full flex-col bg-surface px-5 py-6 sm:px-6">
			<span class="type-heading-3 text-fg">${this.name}</span>
			<span class="mt-3 text-heading-1 leading-none tracking-display text-fg tabular-nums">${this.format(this.score)}</span>
			<span class="mt-2 type-ui text-fg-muted">${this.metric}${this.better === 'lower' ? ', lower is better' : nothing}${` · ${rankLabel}`}</span>
			<ol class="mt-6 flex flex-col gap-3">${picked.map((r, i) => html`<li class="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 text-ui leading-4"><span class="text-caption text-fg-faint tabular-nums">${r.rank ?? i + 1}</span><span class=${r.ours ? 'truncate text-fg' : 'truncate text-fg-muted'}>${r.name}</span><span class=${r.ours ? 'tabular-nums text-fg' : 'tabular-nums text-fg-muted'}>${this.format(r.value)}</span><span class="col-start-2 col-end-4 h-1 bg-edge"><span class=${r.ours ? 'block h-full bg-home-red' : 'block h-full bg-ds-neutral-500'} style="width: ${Math.min(100, (r.value / this.max) * 100)}%"></span></span></li>`)}</ol>
			<span class="mt-auto flex items-center gap-1.5 pt-8 type-ui text-fg-faint">${this.linkLabel}<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1.5 5h7M5.5 2l3 3-3 3"></path></svg></span>
		</a>`
	}
}

define('eval-card', EvalCard)
