/**
 * <conare-marked-text>

 */
export declare class MarkedText extends HTMLElement {
  text: string;
  query: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-marked-text': MarkedText;
  }
}
