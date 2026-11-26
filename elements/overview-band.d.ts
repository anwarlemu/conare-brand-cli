export type OverviewStep = { name: string, value: number | string, unit?: string, line: string, href?: string, red?: boolean }
export type OverviewQuestion = { question: string, answer: string, href?: string, red?: boolean }
export type OverviewLive = { value: string, line: string, link: string, href?: string, searches: OverviewSearch[] }
export type OverviewSearch = { id: string, question: string, agent: string, took_ms: number, outcome: 'strong' | 'weak' | 'none' | (string & {}) }
/**
 * <conare-overview-band>

 */
export declare class OverviewBand extends HTMLElement {
  view: "pipeline" | "questions" | "live";
  steps: OverviewStep[];
  questions: OverviewQuestion[];
  live?: OverviewLive | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-overview-band': OverviewBand;
  }
}
