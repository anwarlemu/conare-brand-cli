export interface ProductMenuItem { label: string, desc: string, href: string }
export interface SiteLink { label: string, href: string, current?: boolean }
/**
 * <conare-site-header>
 * @slot logo The logo in the home link.
 * @slot actions The bar's buttons.
 * @slot sheet-actions The same buttons again, for the sheet on phones.
 */
export declare class SiteHeader extends HTMLElement {
  items: ProductMenuItem[];
  more: ProductMenuItem[];
  links: SiteLink[];
  productCurrent: boolean;
  homeHref: string;
  homeLabel: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-site-header': SiteHeader;
  }
}
