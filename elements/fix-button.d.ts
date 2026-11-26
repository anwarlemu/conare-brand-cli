export type FixState = 'broken' | 'signing' | 'catching' | 'done'
/**
 * <conare-fix-button>
 * @fires press It was pressed (move `state` along from here).
 */
export declare class FixButton extends HTMLElement {
  state: FixState;
  app: string;
  count: number;
  tone?: "red" | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-fix-button': FixButton;
  }
}
