export type PriceCard = { name: string, amount: string, unit?: string, line?: string, facts?: string[] }
/**
 * <conare-pricing-table>

 */
export declare class PricingTable extends HTMLElement {
  heading: string;
  body?: string | undefined;
  cards: PriceCard[];
  titleId: string;
  anchor?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-pricing-table': PricingTable;
  }
}
