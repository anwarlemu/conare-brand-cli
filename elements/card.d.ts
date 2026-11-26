/**
 * <conare-card>
 * @slot (default) The body.
 * @slot actions The head's actions: links or buttons at its end.
 */
export declare class Card extends HTMLElement {
  heading: string;
  framed: boolean;
  flush: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-card': Card;
  }
}
