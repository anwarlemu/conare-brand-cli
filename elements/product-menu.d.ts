export interface ProductMenuItem { label: string, desc: string, href: string }
/**
 * <conare-product-menu>
 * @slot window-0 The first item's window (window-1 the second, and so on through the more links).
 */
export declare class ProductMenu extends HTMLElement {
  items: ProductMenuItem[];
  more: ProductMenuItem[];
  label: string;
  current: boolean;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-product-menu': ProductMenu;
  }
}
