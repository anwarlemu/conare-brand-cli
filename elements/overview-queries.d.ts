export interface QueryDay { day: string, value: number }
export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }
/**
 * <conare-overview-queries>

 */
export declare class OverviewQueries extends HTMLElement {
  thisMonth: number;
  p50: number;
  p95: number;
  days: QueryDay[];
  latency: LineSeries[];
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-overview-queries': OverviewQueries;
  }
}
