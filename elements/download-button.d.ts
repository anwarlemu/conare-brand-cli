/**
 * <conare-download-button>
 * @fires press It was pressed (call download(get, name) from here).
 */
export declare class DownloadButton extends HTMLElement {
  doc: string;
  label?: string | undefined;
  done?: boolean | undefined;
  download(get: () => Promise<Blob | string> | Blob | string, name?: string | undefined): Promise<void>;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-download-button': DownloadButton;
  }
}
