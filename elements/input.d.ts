/**
 * <conare-input>
 * @fires change When the value is committed.
 * @fires input On every keystroke (read `value`).
 * @slot icon A 12px Lucide icon at the start (the filter size).
 */
export declare class Input extends HTMLElement {
  value: string;
  type: string;
  name?: string | undefined;
  placeholder?: string | undefined;
  autocomplete?: string | undefined;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  maxlength?: number | undefined;
  minlength?: number | undefined;
  pattern?: string | undefined;
  inputmode?: string | undefined;
  invalid: boolean;
  label?: string | undefined;
  description?: string | undefined;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  formResetCallback(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-input': Input;
  }
}
