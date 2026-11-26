/**
 * <conare-sidebar-link>
 * @slot (default) The label.
 * @slot icon A 14px Lucide icon.
 */
export declare class SidebarLink extends HTMLElement {
  href?: string | undefined;
  active: boolean;
  status?: string | undefined;
  alert: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-sidebar-link': SidebarLink;
  }
}
