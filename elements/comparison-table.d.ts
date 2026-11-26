export type ComparisonRow = { feature: string, values: (boolean | string)[] }
/**
 * <conare-comparison-table>

 */
export declare class ComparisonTable extends HTMLElement {
  heading: string;
  tag?: string | undefined;
  body?: string | undefined;
  plans: string[];
  rows: ComparisonRow[];
  titleId: string;
  included: string;
  excluded: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-comparison-table': ComparisonTable;
  }
}
