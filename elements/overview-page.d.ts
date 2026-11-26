export interface QueryDay { day: string, value: number }
export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }
export interface OverviewSpender { name: string, cost: number, share: number }
export interface OverviewNamespace { name: string, documents: number, health: 'ready' | 'syncing' | 'error' | 'api', synced?: string, lastUsed?: string }
/**
 * <conare-overview-page>
 * @fires finish-setup Finish setup was pressed.
 * @fires create-key Create API key was pressed.
 * @fires read-docs Read the docs was pressed.
 * @fires billing Billing was pressed.
 * @fires view-all View all was pressed.
 * @fires open-namespace A namespace row was pressed ({ name }).
 */
export declare class OverviewPage extends HTMLElement {
  greeting: string;
  documents: number;
  setup?: { done: number; total: number; } | undefined;
  queries: { thisMonth: number; p50: number; p95: number; days: QueryDay[]; latency: LineSeries[]; };
  credits: { left: number; total: number; spenders: OverviewSpender[]; };
  namespaces: OverviewNamespace[];
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-overview-page': OverviewPage;
  }
}
