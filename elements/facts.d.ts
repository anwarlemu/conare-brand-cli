export type FactItem = { name: string, value: string, mono?: boolean }
/**
 * <conare-facts>
 * @slot (default) <conare-fact> elements, in place of `facts`.
 */
export declare class Facts extends HTMLElement {
  facts: FactItem[];
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-facts': Facts;
  }
}
