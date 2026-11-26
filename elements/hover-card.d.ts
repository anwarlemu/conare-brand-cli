export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
/**
 * <conare-hover-card>
 * @slot (default) One link.
 * @slot card What the card shows (an element, or a <template slot="card">).
 */
export declare class HoverCard extends HTMLElement {
  side: Side;
  align: Align;
  width: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-hover-card': HoverCard;
  }
}
