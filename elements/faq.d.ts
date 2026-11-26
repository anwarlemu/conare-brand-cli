/**
 * <conare-faq>

 */
export declare class Faq extends HTMLElement {
  items: { q: string; a: string; }[];
  heading: string;
  tag: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-faq': Faq;
  }
}
