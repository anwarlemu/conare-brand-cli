export interface Grant { amount: number, reason: string, date: string }
/**
 * <conare-credit-history>

 */
export declare class CreditHistory extends HTMLElement {
  grants: Grant[];
  currency: string;
  step: number;
  timeZone?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-credit-history': CreditHistory;
  }
}
