/**
 * <conare-item>
 * @slot (default) The title, in place of `heading`.
 * @slot media Before the title (a logo, a tile).
 * @slot meta Beside it (a tag, a time).
 * @slot actions At the end, on a row without href only (a link holds no buttons).
 */
export declare class Item extends HTMLElement {
  heading?: string | undefined;
  description?: string | undefined;
  href?: string | undefined;
  arrow: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-item': Item;
  }
}
