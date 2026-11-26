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
 * <conare-accuracy-panel>
 * @fires run Run again was pressed (and after questions were added).
 * @fires tab-change The tab changed (read `tab`).
 */
export declare class AccuracyPanel extends HTMLElement {
  view?: AccuracyView | undefined;
  version: 1 | 2 | 3 | 4;
  link: string;
  asked: string[];
  busy: boolean;
  tab: "searches" | "accuracy";
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-accuracy-panel': AccuracyPanel;
  }
}
