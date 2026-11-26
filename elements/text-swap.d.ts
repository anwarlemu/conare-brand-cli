/**
 * <conare-text-swap>
 * @slot a The first label, shown while `on` is false.
 * @slot b The second label, shown once `on` is true.
 */
export declare class TextSwap extends HTMLElement {
  on: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-text-swap': TextSwap;
  }
}
