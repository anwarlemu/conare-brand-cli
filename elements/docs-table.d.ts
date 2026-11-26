/**
 * <conare-docs-table>

 */
export declare class DocsTable extends HTMLElement {
  head?: string[] | undefined;
  rows: string[][];
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-docs-table': DocsTable;
  }
}
