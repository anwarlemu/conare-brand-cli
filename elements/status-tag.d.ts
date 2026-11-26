export type TagTone = 'default' | 'working' | 'failed' | 'quiet'
/**
 * <conare-status-tag>
 * @slot (default) The word.
 * @slot mark What leads the word; by default a red square on `failed`.
 */
export declare class StatusTag extends HTMLElement {
  status: string;
  working: boolean;
  tone: TagTone;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-status-tag': StatusTag;
  }
}
