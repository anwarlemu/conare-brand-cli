export interface App { type: string, name: string, logo?: string | null }
/**
 * <conare-add-data>
 * @fires connect An app was picked; detail { app }.
 * @fires files Files were dropped or chosen; detail { files }.
 * @fires copied The prompt is on the clipboard.
 * @fires open Open the namespace the first write landed in; detail { namespace }.
 * @fires close The close button.
 */
export declare class AddData extends HTMLElement {
  apps: App[];
  prompt: string;
  code: string;
  namespace: string;
  connecting?: string | undefined;
  uploading?: number | undefined;
  waiting: boolean;
  landed: boolean;
  error?: string | undefined;
  closable: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-add-data': AddData;
  }
}
