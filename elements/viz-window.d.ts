/**
 * <conare-viz-window>
 * @slot title What the bar says after the mark.
 * @slot (default) The window's body.
 */
export declare class VizWindow extends HTMLElement {
  active: boolean;
  size: "sm" | "md";
  stretch: boolean;
  relative: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-viz-window': VizWindow;
  }
}
