export interface ScopeOption { name: string, documents: number, logo?: string | null }
export interface ComboOption { value: string | number, label: string, hint?: string, disabled?: boolean, pinned?: boolean }
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
/**
 * <conare-scope-menu>
 * @fires input The scope changed (read `value`).
 * @fires change The scope changed (read `value`).
 * @fires select An option was picked (detail: the option).
 */
export declare class ScopeMenu extends HTMLElement {
  namespaces: ScopeOption[];
  single: boolean;
  ownMark?: string | undefined;
  filter: boolean | "auto";
  filterLabel: string;
  width?: string | undefined;
  value: string | number;
  options: ComboOption[];
  label: string;
  placeholder: string;
  side: Side;
  align: Align;
  matchWidth: boolean;
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
    'conare-scope-menu': ScopeMenu;
  }
}
