export type SiteAction = { label: string, href: string }
export type PriceCard = { name: string, amount: string, unit?: string, line?: string, facts?: string[] }
export interface SiteHeaderData { items: ProductMenuItem[], more?: ProductMenuItem[], links: SiteLink[], productCurrent?: boolean, homeHref?: string, homeLabel?: string }
export interface ProductMenuItem { label: string, desc: string, href: string }
export interface SiteLink { label: string, href: string, current?: boolean }
export interface SiteFooterData { columns: { title: string, links: FooterLink[] }[], tagline?: string, legal?: string, legalLinks?: FooterLink[], name?: string }
export type FooterLink = { label: string, href: string }
export interface SiteAnnouncement { tag: string, text: string, cta?: string, href: string }
/**
 * <conare-pricing-page>
 * @slot logo The logo in the header's home link.
 * @slot actions The header's buttons.
 * @slot sheet-actions The same buttons again, for the header's sheet on phones.
 */
export declare class PricingPage extends HTMLElement {
  head: { tag?: string; title: string; body?: string; action: SiteAction; };
  groups: { key: string; title: string; body?: string; cards: PriceCard[]; }[];
  enterprise?: { title: string; body: string; action: SiteAction; items: { name: string; line: string; }[]; } | undefined;
  faq: { q: string; a: string; }[];
  cta: { title: string; action: { label: string; href: string; }; };
  header: SiteHeaderData;
  footer: SiteFooterData;
  announcement?: SiteAnnouncement | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-pricing-page': PricingPage;
  }
}
