/**
 * <conare-meter>

 */
export declare class Meter extends HTMLElement {
  value: number;
  max: number;
  label?: string | undefined;
  tone: "top" | "default" | "rest";
  decorative: boolean;
  live: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-meter': Meter;
  }
}
