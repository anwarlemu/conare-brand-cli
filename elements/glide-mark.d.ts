/**
 * <conare-glide-mark>

 */
export declare class GlideMark extends HTMLElement {
  mark: { y: number; h: number; } | null;
  instant: boolean;
  follow: boolean;
  rest: number | null;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-glide-mark': GlideMark;
  }
}
