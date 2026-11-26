/**
 * <conare-copy-button>
 * @fires copied The text is on the clipboard.
 */
export declare class CopyButton extends HTMLElement {
  text: string;
  label: string;
  rootName: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-copy-button': CopyButton;
  }
}
