/**
 * <conare-toggle>
 * @fires pressed-change It was pressed; detail.value is the new state.
 * @slot (default) The label, with a Lucide icon before it if any.
 */
export declare class Toggle extends HTMLElement {
  pressed: boolean;
  disabled: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-toggle': Toggle;
  }
}
