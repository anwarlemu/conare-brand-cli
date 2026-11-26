/**
 * <conare-resizable>
 * @fires input The split moved (read `value`).
 * @fires change The split moved (read `value`).
 * @slot first The first pane (left, or top when vertical).
 * @slot second The second pane.
 */
export declare class Resizable extends HTMLElement {
  value: number;
  direction: "horizontal" | "vertical";
  min: number;
  max: number;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-resizable': Resizable;
  }
}
