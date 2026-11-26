export type AccordionValue = string | string[] | null
/**
 * <conare-accordion>
 * @fires input A row opened or closed (read `value`).
 * @fires change A row opened or closed (read `value`).
 * @slot (default) The rows: <conare-accordion-item>.
 */
export declare class Accordion extends HTMLElement {
  multiple: boolean;
  value: AccordionValue;
  isOpen(v: string): boolean;
  toggle(v: string): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-accordion': Accordion;
  }
}
