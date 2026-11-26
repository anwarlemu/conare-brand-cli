export type ListRow = { name: string, documents: number, created: string, searched: string, model?: string, docs?: ListDoc[] }
export type ListDoc = { id: string, updated: string, size: string }
/**
 * <conare-list-detail-page>
 * @fires change A row opened or the page went back to the list (read `open`).
 * @fires create The list's dark button was pressed.
 * @fires search The thing's dark button was pressed; detail is its row.
 */
export declare class ListDetailPage extends HTMLElement {
  rows: ListRow[];
  heading?: string | undefined;
  noun?: string | undefined;
  open: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-list-detail-page': ListDetailPage;
  }
}
