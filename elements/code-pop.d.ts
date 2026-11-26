/**
 * <conare-code-pop>

 */
export declare class CodePop extends HTMLElement {
  code: string;
  label: string;
  heading: string;
  tab?: string | undefined;
  opened: boolean;
  large: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-code-pop': CodePop;
  }
}
