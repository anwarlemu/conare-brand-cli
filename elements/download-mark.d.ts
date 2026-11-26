export type DownloadState = 'busy' | 'done' | 'failed'
/**
 * <conare-download-mark>
 * @fires press It was pressed (call download(get, name) from here).
 */
export declare class DownloadMark extends HTMLElement {
  doc: string;
  state?: DownloadState | undefined;
  download(get: () => Promise<Blob | string> | Blob | string, name?: string | undefined): Promise<void>;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-download-mark': DownloadMark;
  }
}
