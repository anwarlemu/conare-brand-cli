export type DayPoint = { day: string, value: number }
/**
 * <conare-bar-chart>

 */
export declare class BarChart extends HTMLElement {
  points: DayPoint[];
  label: string;
  height: number;
  lit?: number[] | undefined;
  note?: string | undefined;
  week?: string | undefined;
  held: boolean;
  bare: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-bar-chart': BarChart;
  }
}
