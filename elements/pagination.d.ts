/**
 * <conare-pagination>
 * @fires page-change The page changed (detail.value; read `page`).
 */
export declare class Pagination extends HTMLElement {
  page: number;
  pages: number;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-pagination': Pagination;
  }
}
