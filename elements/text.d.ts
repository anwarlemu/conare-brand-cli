export type TextVariant = 'title' | 'ui' | 'strong' | 'meta' | 'caption' | 'code' | 'code-sm' | 'link' | 'mark'
/**
 * <conare-text>
 * @slot (default) The text.
 */
export declare class Text extends HTMLElement {
  variant: TextVariant;
  as?: string | undefined;
  href?: string | undefined;
  tag: string;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-text': Text;
  }
}
