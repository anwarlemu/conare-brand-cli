export interface Crumb { label: string, href?: string, mono?: boolean }
/**
 * <conare-console-frame>
 * @fires navigate A sidebar link was pressed ({ link }).
 * @slot (default) The page.
 * @slot nav The sidebar's labels and links.
 * @slot head The workspace switcher.
 * @slot foot The account menu.
 * @slot bar What sits at the bar's end.
 */
export declare class ConsoleFrame extends HTMLElement {
  crumbs: Crumb[];
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-console-frame': ConsoleFrame;
  }
}
