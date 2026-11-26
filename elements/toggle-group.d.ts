export type ToggleGroupOption = string | { value: string, label: string, disabled?: boolean }
export type ToggleGroupValue = string | string[] | null
/**
 * <conare-toggle-group>
 * @fires input A button was pressed (read `value`).
 * @fires change A button was pressed (read `value`).
 */
export declare class ToggleGroup extends HTMLElement {
  options: ToggleGroupOption[];
  label: string;
  multiple: boolean;
  value: ToggleGroupValue;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-toggle-group': ToggleGroup;
  }
}
