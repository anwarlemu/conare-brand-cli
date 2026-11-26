/**
 * <conare-separator>

 */
export declare class Separator extends HTMLElement {
  orientation: "horizontal" | "vertical";
  inset: boolean;
  semantic: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-separator': Separator;
  }
}
