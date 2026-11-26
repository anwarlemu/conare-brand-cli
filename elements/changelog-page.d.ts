export type ChangelogEntry = { id: string, date: string, version?: string, title: string, blocks: DocsBlock[] }
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
export interface SiteHeaderData { items: ProductMenuItem[], more?: ProductMenuItem[], links: SiteLink[], productCurrent?: boolean, homeHref?: string, homeLabel?: string }
export interface ProductMenuItem { label: string, desc: string, href: string }
export interface SiteLink { label: string, href: string, current?: boolean }
export interface SiteFooterData { columns: { title: string, links: FooterLink[] }[], tagline?: string, legal?: string, legalLinks?: FooterLink[], name?: string }
export type FooterLink = { label: string, href: string }
export interface SiteAnnouncement { tag: string, text: string, cta?: string, href: string }
/**
 * <conare-changelog-page>
 * @slot logo The logo in the header's home link.
 * @slot actions The header's buttons.
 * @slot sheet-actions The same buttons again, for the header's sheet on phones.
 */
export declare class ChangelogPage extends HTMLElement {
  head: { tag?: string; title: string; body?: string; };
  entries: ChangelogEntry[];
  cta: { title: string; action: { label: string; href: string; }; };
  header: SiteHeaderData;
  footer: SiteFooterData;
  announcement?: SiteAnnouncement | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-changelog-page': ChangelogPage;
  }
}
