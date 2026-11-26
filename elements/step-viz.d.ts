/**
 * <conare-step-viz>
 * @slot title What the bar says after the mark.
 * @slot (default) The window's body.
 */
export declare class StepViz extends HTMLElement {
  step: number;
  runs: number[];
  active: boolean;
  size: "sm" | "md";
  stretch: boolean;
  relative: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-step-viz': StepViz;
  }
}
