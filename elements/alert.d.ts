/**
 * <conare-alert>
 * @slot (default) What went wrong, after the subject.
 * @slot action The button that fixes it.
 */
export declare class Alert extends HTMLElement {
  heading: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-alert': Alert;
  }
}
