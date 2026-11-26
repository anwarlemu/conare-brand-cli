/**
 * <conare-toaster>

 */
export declare class Toaster extends HTMLElement {
  toast(text: string, detail?: string | undefined): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-toaster': Toaster;
  }
}
