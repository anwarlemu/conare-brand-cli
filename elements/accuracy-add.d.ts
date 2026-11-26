/**
 * <conare-accuracy-add>
 * @fires add Add and run was pressed ({ questions }).
 * @fires close The close button was pressed.
 */
export declare class AccuracyAdd extends HTMLElement {
  asked: string[];
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-accuracy-add': AccuracyAdd;
  }
}
