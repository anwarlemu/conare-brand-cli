/**
 * <conare-link>
 * @fires click When pressed (the native click).
 * @slot (default) The link's text.
 */
export declare class Link extends HTMLElement {
  href?: string | undefined;
  more: boolean;
  target?: string | undefined;
  rel?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-link': Link;
  }
}
