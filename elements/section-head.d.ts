/**
 * <conare-section-head>
 * @slot action The one action: a button-link.
 */
export declare class SectionHead extends HTMLElement {
  heading: string;
  tag?: string | undefined;
  body?: string | undefined;
  as: "h1" | "h2";
  align: "start" | "center";
  titleId?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-section-head': SectionHead;
  }
}
