/**
 * <conare-work-window>
 * @slot (default) The body.
 */
export declare class WorkWindow extends HTMLElement {
  heading: string;
  tag?: string | undefined;
  foot?: string | undefined;
  done: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-work-window': WorkWindow;
  }
}
