export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
/**
 * <conare-tooltip>
 * @slot (default) One focusable trigger.
 */
export declare class Tooltip extends HTMLElement {
  text: string;
  side: Side;
  align: Align;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-tooltip': Tooltip;
  }
}
