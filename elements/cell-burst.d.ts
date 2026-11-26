/**
 * <conare-cell-burst>

 */
export declare class CellBurst extends HTMLElement {
  seed: number;
  jumble: boolean;
  ledger: boolean;
  strong: boolean;
  trace: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-cell-burst': CellBurst;
  }
}
