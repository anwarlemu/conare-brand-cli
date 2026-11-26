/**
 * <conare-console-page>
 * @slot (default) The body, in 24px steps.
 * @slot meta Beside the title.
 * @slot actions The page's actions on the right.
 */
export declare class ConsolePage extends HTMLElement {
  heading: string;
  mono: boolean;
  rootName: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-console-page': ConsolePage;
  }
}
