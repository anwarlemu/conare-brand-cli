export type SearchResult = { namespace: string, id: string, score: number, text: string, page?: ResultPage }
export type ResultPage = { number: number, count: number, top: number, file: string }
/**
 * <conare-search-run>
 * @fires reveal A found document's square was pressed; detail { key }.
 */
export declare class SearchRun extends HTMLElement {
  searching: boolean;
  answer: { results: SearchResult[]; took_ms: number; } | null;
  namespaces: { name: string; documents: number; }[];
  ns?: string | undefined;
  logoOf?: ((namespace: string) => string | null | undefined) | undefined;
  nsHref?: ((namespace: string) => string) | undefined;
  code?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-search-run': SearchRun;
  }
}
