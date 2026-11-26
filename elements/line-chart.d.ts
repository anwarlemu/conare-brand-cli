export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }
/**
 * <conare-line-chart>

 */
export declare class LineChart extends HTMLElement {
  heading: string;
  series: LineSeries[];
  format: (value: number) => string;
  smooth?: number | undefined;
  height?: number | undefined;
  bare: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-line-chart': LineChart;
  }
}
