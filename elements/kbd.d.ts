/**
 * <conare-kbd>
 * @slot (default) The key or keys.
 */
export declare class Kbd extends HTMLElement {
  boxed: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-kbd': Kbd;
  }
}
