export type DocsBlock =
	| { kind: 'p', text: string }
	| { kind: 'h2' | 'h3', id: string, text: string }
	| { kind: 'list', items: string[] }
	| { kind: 'callout', tone: 'note' | 'warning' | 'caution' | (string & {}), text: string }
	| { kind: 'table', head?: string[], rows: string[][] }
	| { kind: 'code', samples: { label: string, code: string }[] }
	| { kind: 'cards', items: { title: string, body: string, href: string }[] }
	| { kind: 'fields', media?: string, fields: DocsField[] }
export type DocsField = { name: string, type: string, required?: boolean, default?: string, text?: string, notes?: string[], children?: DocsField[] }
export type Feature = { title: string, body: string }
export interface SiteHeaderData { items: ProductMenuItem[], more?: ProductMenuItem[], links: SiteLink[], productCurrent?: boolean, homeHref?: string, homeLabel?: string }
export interface ProductMenuItem { label: string, desc: string, href: string }
export interface SiteLink { label: string, href: string, current?: boolean }
export interface SiteFooterData { columns: { title: string, links: FooterLink[] }[], tagline?: string, legal?: string, legalLinks?: FooterLink[], name?: string }
export type FooterLink = { label: string, href: string }
export interface SiteAnnouncement { tag: string, text: string, cta?: string, href: string }
/**
 * <conare-about-page>
 * @slot logo The logo in the header's home link.
 * @slot actions The header's buttons.
 * @slot sheet-actions The same buttons again, for the header's sheet on phones.
 */
export declare class AboutPage extends HTMLElement {
  head: { tag?: string; title: string; body?: string; };
  story: DocsBlock[];
  numbers: { value: string; label: string; }[];
  values: { title: string; tag?: string; body?: string; features: Feature[]; };
  cta: { title: string; action: { label: string; href: string; }; };
  header: SiteHeaderData;
  footer: SiteFooterData;
  announcement?: SiteAnnouncement | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-about-page': AboutPage;
  }
}
