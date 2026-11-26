/**
 * <conare-pixel-button>
 * @fires click When pressed.
 * @slot (default) The label, with a Lucide icon if any.
 */
export declare class PixelButton extends HTMLElement {
  done: boolean;
  large: boolean;
  href?: string | undefined;
  type: "button" | "submit";
  disabled: boolean;
  label?: string | undefined;
  busy?: boolean | undefined;
  rootName: string;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-pixel-button': PixelButton;
  }
}
