/**
 * <conare-stat>
 * @fires press A pressable stat was pressed.
 * @slot (default) The value, in place of `value`.
 */
export declare class Stat extends HTMLElement {
  label: string;
  value?: string | undefined;
  pressed?: boolean | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-stat': Stat;
  }
}
