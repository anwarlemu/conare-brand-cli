export type FooterLink = { label: string, href: string }
/**
 * <conare-site-footer>

 */
export declare class SiteFooter extends HTMLElement {
  columns: { title: string; links: FooterLink[]; }[];
  tagline?: string | undefined;
  legal?: string | undefined;
  legalLinks: FooterLink[];
  name: string;
  pinned: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-site-footer': SiteFooter;
  }
}
