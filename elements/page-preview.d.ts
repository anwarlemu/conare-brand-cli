export type ResultPage = { number: number, count: number, top: number, file: string }
/**
 * <conare-page-preview>

 */
export declare class PagePreview extends HTMLElement {
  page: ResultPage;
  text: string;
  query: string;
  size: "thumb" | "mid" | "full";
  marked: boolean;
  here: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-page-preview': PagePreview;
  }
}
