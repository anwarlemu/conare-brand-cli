export type Subprocessor = { name: string, terms: string, purpose: string, data: string, location: string }
/**
 * <conare-subprocessor-table>

 */
export declare class SubprocessorTable extends HTMLElement {
  rows: Subprocessor[];
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-subprocessor-table': SubprocessorTable;
  }
}
