/**
 * <conare-call-to-action>
 * @slot (default) The one action.
 */
export declare class CallToAction extends HTMLElement {
  heading: string;
  seed: number;
  titleId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-call-to-action': CallToAction;
  }
}
