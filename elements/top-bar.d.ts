/**
 * <conare-top-bar>
 * @slot (default) A <conare-breadcrumb>.
 * @slot start The phone's menu button.
 * @slot end What belongs to the whole console.
 */
export declare class TopBar extends HTMLElement {
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-top-bar': TopBar;
  }
}
