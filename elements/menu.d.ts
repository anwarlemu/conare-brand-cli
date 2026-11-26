/**
 * <conare-menu>
 * @fires open-change It opened or closed (detail.value).
 * @slot (default) The rows: <conare-menu-item>, <conare-menu-label>, <conare-menu-separator>.
 * @slot trigger A <button> to use as the trigger, or the default trigger's content.
 */
export declare class Menu extends HTMLElement {
  label: string;
  up: boolean;
  placement: "start" | "end";
  width: string;
  offset: string;
  triggerLabel?: string | undefined;
  open: boolean;
  show(focus?: "first" | "last" | "none"): void;
  close(refocus?: boolean): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-menu': Menu;
  }
}
