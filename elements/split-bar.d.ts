export type SplitPart = { name: string, value: number, display?: string, detail?: string }
/**
 * <conare-split-bar>
 * @fires input The picked part changed (read `value`, its index).
 * @fires change The picked part changed.
 */
export declare class SplitBar extends HTMLElement {
  parts: SplitPart[];
  label?: string | undefined;
  value: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-split-bar': SplitBar;
  }
}
