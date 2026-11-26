/**
 * <conare-dot-matrix>

 */
export declare class DotMatrix extends HTMLElement {
  tone?: "default" | "inverse" | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-dot-matrix': DotMatrix;
  }
}
