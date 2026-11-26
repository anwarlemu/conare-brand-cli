export type SiteAction = { label: string, href: string }
export type Logo = { name: string, mark?: boolean }
export type Feature = { title: string, body: string }
export interface SiteHeaderData { items: ProductMenuItem[], more?: ProductMenuItem[], links: SiteLink[], productCurrent?: boolean, homeHref?: string, homeLabel?: string }
export interface ProductMenuItem { label: string, desc: string, href: string }
export interface SiteLink { label: string, href: string, current?: boolean }
export interface SiteFooterData { columns: { title: string, links: FooterLink[] }[], tagline?: string, legal?: string, legalLinks?: FooterLink[], name?: string }
export type FooterLink = { label: string, href: string }
export interface SiteAnnouncement { tag: string, text: string, cta?: string, href: string }
/**
 * <conare-home-page>
 * @slot window The window in the hero's red frame.
 * @slot logo The logo in the header's home link.
 * @slot actions The header's buttons.
 * @slot sheet-actions The same buttons again, for the header's sheet on phones.
 */
export declare class HomePage extends HTMLElement {
  hero: { eyebrow?: string; title: string; body?: string; action: SiteAction; };
  logos: { title: string; tag?: string; logos: Logo[]; };
  features: { title: string; tag?: string; body?: string; features: Feature[]; };
  testimonial: { quote: string; role: string; company: string; };
  faq: { q: string; a: string; }[];
  cta: { title: string; action: { label: string; href: string; }; };
  header: SiteHeaderData;
  footer: SiteFooterData;
  announcement?: SiteAnnouncement | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-home-page': HomePage;
  }
}
