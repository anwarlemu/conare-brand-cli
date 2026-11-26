/**
 * <conare-answer-text>
 * @fires cite A citation was pressed; detail { n }.
 * @fires point A citation is under the pointer or focus; detail { n }.
 */
export declare class AnswerText extends HTMLElement {
  text: string;
  pointed?: number | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-answer-text': AnswerText;
  }
}
