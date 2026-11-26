export interface AccuracyView {
	state: 'running' | 'done'
	/** When it ran, as the page says it ("3 hours ago"), who ran it, how long it took and what it cost. */
	ran: string
	by: string
	seconds: number
	cost: number
	questions: number
	done: number
	right: number
	current_right: number
	current_name: string
	rows: AccuracyRow[]
	queued: Array<{ id: string, question: string, namespace: string }>
}
export interface AccuracyRow { id: string, question: string, namespace: string, conare: AccuracyHit, current: AccuracyHit, fix?: { why: string, action: string } }
export interface AccuracyHit { id: string, number: number, count: number, top: number, text: string, key: string, ok: boolean }
/**
 * <conare-accuracy-sheet>
 * @fires add Questions were added ({ questions }).
 */
export declare class AccuracySheet extends HTMLElement {
  view?: AccuracyView | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-accuracy-sheet': AccuracySheet;
  }
}
