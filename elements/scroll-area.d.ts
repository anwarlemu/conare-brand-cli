/**
 * <conare-scroll-area>
 * @slot (default) The content.
 */
export declare class ScrollArea extends HTMLElement {
  label?: string | undefined;
  maxHeight?: string | undefined;
  axis: "y" | "x" | "both";
  tone: "dark" | "default";
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-scroll-area': ScrollArea;
  }
}
