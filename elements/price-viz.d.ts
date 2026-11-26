export interface PriceData { benchmark: string, metric: string, points: PricePoint[], note?: string }
export interface PricePoint { name: string, price: number, score: number, ours?: boolean }
export type Axis = { min: number, max: number, ticks: number[] }
/**
 * <conare-price-viz>
 * @slot title What the bar says after the mark.
 * @slot (default) The window's body.
 */
export declare class PriceViz extends HTMLElement {
  data: PriceData;
  x: Axis;
  y: Axis;
  active: boolean;
  size: "sm" | "md";
  stretch: boolean;
  relative: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-price-viz': PriceViz;
  }
}
