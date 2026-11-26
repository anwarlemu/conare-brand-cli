export type SearchResult = { namespace: string, id: string, score: number, text: string, page?: ResultPage }
export type ResultPage = { number: number, count: number, top: number, file: string }
/**
 * <conare-search-results>
 * @fires cite A citation in the answer was pressed; detail { key } (the result's key).
 */
export declare class SearchResults extends HTMLElement {
  results: SearchResult[];
  query: string;
  answer?: string | undefined;
  writing: boolean;
  reveal: { key: string; at: number; } | null;
  logoOf?: ((namespace: string) => string | null | undefined) | undefined;
  download?: ((result: SearchResult) => void) | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-search-results': SearchResults;
  }
}
