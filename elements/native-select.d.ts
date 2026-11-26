/**
 * <conare-native-select>
 * @fires change The pick changed (read `value`).
 * @fires input The pick changed (read `value`).
 * @slot (default) The <option>s (copied into the select).
 */
export declare class NativeSelect extends HTMLElement {
  value?: string | undefined;
  name?: string | undefined;
  small: boolean;
  mono: boolean;
  disabled: boolean;
  required: boolean;
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
    'conare-native-select': NativeSelect;
  }
}
