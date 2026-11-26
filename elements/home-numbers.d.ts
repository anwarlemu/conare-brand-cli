export type HomeNumbersTake = 'strip' | 'rule' | 'line'
export type HomeNumbersTarget = 'documents' | 'queries' | 'performance'
/**
 * <conare-home-numbers>
 * @fires navigate A number was pressed ({ target, event }; prevent the event's default to route it yourself).
 */
export declare class HomeNumbers extends HTMLElement {
  take: HomeNumbersTake;
  documents: number;
  namespaces: number;
  queries: number;
  typical: number;
  slowest: number;
  days: number[];
  hrefs: Partial<Record<HomeNumbersTarget, string>>;
  plays: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-home-numbers': HomeNumbers;
  }
}
