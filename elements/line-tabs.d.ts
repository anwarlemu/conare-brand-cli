export type LineTabOption = string | { value: string, label: string }
/**
 * <conare-line-tabs>
 * @fires input The pick changed (read `value`).
 * @fires change The pick changed (read `value`).
 */
export declare class LineTabs extends HTMLElement {
  value: string;
  options: LineTabOption[];
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-line-tabs': LineTabs;
  }
}
