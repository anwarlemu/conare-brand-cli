/**
 * <conare-field>
 * @slot (default) The control: <conare-input>, <conare-select>, or any input.
 */
export declare class Field extends HTMLElement {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-field': Field;
  }
}
