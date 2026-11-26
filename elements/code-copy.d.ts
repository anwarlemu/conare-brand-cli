/**
 * <conare-code-copy>
 * @fires copied The text is on the clipboard.
 */
export declare class CodeCopy extends HTMLElement {
  text: string;
  light: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-code-copy': CodeCopy;
  }
}
