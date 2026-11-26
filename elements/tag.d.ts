export type TagTone = 'default' | 'working' | 'failed' | 'quiet'
/**
 * <conare-tag>
 * @slot (default) The word.
 * @slot mark What leads the word; by default a red square on `failed`.
 */
export declare class Tag extends HTMLElement {
  tone: TagTone;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-tag': Tag;
  }
}
