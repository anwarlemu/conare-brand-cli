/**
 * <conare-avatar>

 */
export declare class Avatar extends HTMLElement {
  name?: string | undefined;
  src?: string | undefined;
  variant: "tile" | "solid";
  size: 20 | 28 | 32;
  initial: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-avatar': Avatar;
  }
}
