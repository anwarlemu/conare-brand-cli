export type SearchResult = { namespace: string, id: string, score: number, text: string, page?: ResultPage }
export type ResultPage = { number: number, count: number, top: number, file: string }
/**
 * <conare-written-answer>
 * @fires write Write an answer was pressed (request mode).
 * @fires cite A citation was pressed; detail { key } (the result's key).
 */
export declare class WrittenAnswer extends HTMLElement {
  results: SearchResult[];
  text: string;
  writing: boolean;
  error?: string | undefined;
  mode: "first" | "request" | "beside";
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-written-answer': WrittenAnswer;
  }
}
