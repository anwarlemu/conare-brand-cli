/**
 * <conare-sheet>
 * @fires open-change It opened or closed (detail.value; read `open`).
 * @slot (default) The body.
 * @slot bar Controls in the bar, before the close button.
 * @slot foot Buttons at the foot.
 */
export declare class Sheet extends HTMLElement {
  heading: string;
  description?: string | undefined;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-sheet': Sheet;
  }
}
