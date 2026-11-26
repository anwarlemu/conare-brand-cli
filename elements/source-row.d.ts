export type SourceStatus = 'ready' | 'syncing' | 'connecting' | 'error' | 'pushed'
/**
 * <conare-source-row>
 * @fires open The name was pressed; detail { event } (call event.preventDefault() to stay on the page).
 */
export declare class SourceRow extends HTMLElement {
  name: string;
  app: string;
  logo?: string | null | undefined;
  status: SourceStatus;
  every?: string | undefined;
  synced?: string | undefined;
  next?: string | undefined;
  detail: boolean;
  href?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-source-row': SourceRow;
  }
}
