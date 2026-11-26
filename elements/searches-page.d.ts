export interface SearchRow { id: string, when: string, question: string, agent: string, outcome: SearchOutcome, tookMs: number, passages: SearchPassage[], why?: string, fix?: { action: string } }
export type SearchOutcome = 'strong' | 'weak' | 'none' | 'failed'
export interface SearchPassage { id: string, namespace: string, text: string, key: string }
export type Show = 'all' | Exclude<SearchOutcome, 'strong'>
/**
 * <conare-searches-page>
 * @fires change The filter changed (read `show`).
 * @fires connect Connect an agent was pressed.
 */
export declare class SearchesPage extends HTMLElement {
  rows: SearchRow[];
  show: Show;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-searches-page': SearchesPage;
  }
}
