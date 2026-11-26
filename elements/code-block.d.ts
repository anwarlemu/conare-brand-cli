/**
 * <conare-code-block>
 * @fires copied The code is on the clipboard.
 */
export declare class CodeBlock extends HTMLElement {
  code?: string | undefined;
  label?: string | undefined;
  samples?: { label: string; code: string; }[] | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-code-block': CodeBlock;
  }
}
