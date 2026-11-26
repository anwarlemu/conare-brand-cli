/**
 * <conare-show-more>
 * @fires click Pressed (pointer, Enter or Space).
 * @slot (default) The words, in place of `label`.
 */
export declare class ShowMore extends HTMLElement {
  count: number;
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-show-more': ShowMore;
  }
}
