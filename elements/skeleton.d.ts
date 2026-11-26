/**
 * <conare-skeleton>
 * @slot (default) The real markup, drawn from a blank record while held.
 */
export declare class Skeleton extends HTMLElement {
  held: boolean;
  target?: string | undefined;
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-skeleton': Skeleton;
  }
}
