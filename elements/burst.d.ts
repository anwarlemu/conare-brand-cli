/**
 * <conare-burst>

 */
export declare class Burst extends HTMLElement {
  seed: number;
  rays: number;
  inner: number;
  corners: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-burst': Burst;
  }
}
