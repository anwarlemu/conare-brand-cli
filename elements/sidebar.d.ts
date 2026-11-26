/**
 * <conare-sidebar>
 * @slot (default) Labels and links.
 * @slot head The workspace switcher.
 * @slot foot The account menu.
 */
export declare class Sidebar extends HTMLElement {
  label?: string | undefined;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-sidebar': Sidebar;
  }
}
