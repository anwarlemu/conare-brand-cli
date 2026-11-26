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
/**
 * <conare-docs-blocks>

 */
export declare class DocsBlocks extends HTMLElement {
  blocks: DocsBlock[];
  wide: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-docs-blocks': DocsBlocks;
  }
}
