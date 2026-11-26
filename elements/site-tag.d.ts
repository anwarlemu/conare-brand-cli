/**
 * <conare-site-tag>
 * @slot (default) The word.
 */
export declare class SiteTag extends HTMLElement {
  framed: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-site-tag': SiteTag;
  }
}
