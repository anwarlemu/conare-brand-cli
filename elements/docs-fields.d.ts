export type DocsField = { name: string, type: string, required?: boolean, default?: string, text?: string, notes?: string[], children?: DocsField[] }
/**
 * <conare-docs-fields>

 */
export declare class DocsFields extends HTMLElement {
  fields: DocsField[];
  nested: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-docs-fields': DocsFields;
  }
}
