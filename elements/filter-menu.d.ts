export interface FilterGroup { key: string, label: string, options: Array<{ value: string | number, label: string }> }
export type FilterValues = Record<string, string | number>
/**
 * <conare-filter-menu>
 * @fires input A filter changed (read `value`).
 * @fires change A filter changed (read `value`).
 */
export declare class FilterMenu extends HTMLElement {
  groups: FilterGroup[];
  value: FilterValues;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-filter-menu': FilterMenu;
  }
}
