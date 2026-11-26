/**
 * <conare-door>
 * @fires click When pressed.
 * @slot (default) Replaces the description.
 * @slot icon A 14px Lucide icon before the title.
 */
export declare class Door extends HTMLElement {
  heading: string;
  description?: string | undefined;
  href?: string | undefined;
  arrow: boolean;
  expanded: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-door': Door;
  }
}
