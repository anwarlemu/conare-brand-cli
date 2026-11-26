export interface ComboOption { value: string | number, label: string, hint?: string, disabled?: boolean, pinned?: boolean }
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
/**
 * <conare-select>
 * @fires input The pick changed (read `value`).
 * @fires change The pick changed (read `value`).
 * @fires select An option was picked (detail: the option).
 */
export declare class Select extends HTMLElement {
  filter: boolean | "auto";
  matchWidth: boolean;
  value: string | number;
  options: ComboOption[];
  label: string;
  placeholder: string;
  filterLabel: string;
  width?: string | undefined;
  side: Side;
  align: Align;
  disabled: boolean;
  name?: string | undefined;
  required: boolean;
  description?: string | undefined;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  syncValidity(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-select': Select;
  }
}
