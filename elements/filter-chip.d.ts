export type FilterValue = string | number
/**
 * <conare-filter-chip>
 * @fires input The pick changed (read `value`).
 * @fires change The pick changed (read `value`).
 */
export declare class FilterChip extends HTMLElement {
  label: string;
  any: string;
  options: { value: FilterValue; label: string; }[];
  width: string;
  value: FilterValue;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-filter-chip': FilterChip;
  }
}
