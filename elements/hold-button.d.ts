/**
 * <conare-hold-button>
 * @fires confirm Once the hold completes and the check has drawn.
 */
export declare class HoldButton extends HTMLElement {
  label: string;
  ms: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-hold-button': HoldButton;
  }
}
