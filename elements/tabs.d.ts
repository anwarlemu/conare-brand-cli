export type TabOption = string | { value: string, label: string, disabled?: boolean }
/**
 * <conare-tabs>
 * @fires input The pick changed (read `value`).
 * @fires change The pick changed (read `value`).
 */
export declare class Tabs extends HTMLElement {
  value: string;
  options: TabOption[];
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-tabs': Tabs;
  }
}
