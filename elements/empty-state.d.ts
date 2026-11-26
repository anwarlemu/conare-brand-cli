/**
 * <conare-empty-state>
 * @slot (default) The actions (buttons).
 */
export declare class EmptyState extends HTMLElement {
  heading: string;
  description?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-empty-state': EmptyState;
  }
}
