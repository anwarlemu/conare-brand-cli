/**
 * <conare-app-mark>

 */
export declare class AppMark extends HTMLElement {
  name: string;
  logo?: string | null | undefined;
  size: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-app-mark': AppMark;
  }
}
