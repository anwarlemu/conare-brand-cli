export type StepState = 'now' | 'done' | 'todo' | 'next'
/**
 * <conare-step>
 * @fires open The head was pressed (open or fold it).
 * @slot (default) The body: a line on what to do and its action.
 */
export declare class Step extends HTMLElement {
  n: number;
  heading: string;
  state: StepState;
  says?: string | undefined;
  locked: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-step': Step;
  }
}
