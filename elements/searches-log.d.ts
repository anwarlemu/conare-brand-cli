export interface SearchRow { id: string, when: string, question: string, agent: string, outcome: SearchOutcome, tookMs: number, passages: SearchPassage[], why?: string, fix?: { action: string } }
export type SearchOutcome = 'strong' | 'weak' | 'none' | 'failed'
export interface SearchPassage { id: string, namespace: string, text: string, key: string }
/**
 * <conare-searches-log>
 * @fires download A passage's document was pressed ({ passage }).
 * @fires fix A search's fix was pressed ({ row }).
 * @fires search Search it was pressed ({ question }).
 */
export declare class SearchesLog extends HTMLElement {
  rows: SearchRow[];
  page: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-searches-log': SearchesLog;
  }
}
