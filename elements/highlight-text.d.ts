/**
 * <conare-highlight-text>

 */
export declare class HighlightText extends HTMLElement {
  as: "h1" | "h2" | "h3" | "p";
  text: string;
  accent: string;
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-highlight-text': HighlightText;
  }
}
