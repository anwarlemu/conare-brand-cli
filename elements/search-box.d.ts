export interface Attachment { key: string, name: string, state: 'adding' | 'added' | 'failed' }
/**
 * <conare-search-box>
 * @fires submit Search; detail { question }.
 * @fires files Files to add (picked or dropped); detail { files }.
 * @fires paste Text to add; detail { text }.
 * @fires connect Connect an app was chosen.
 * @fires remove An attached file's cross; detail { key }.
 * @fires input The question changed (read `value`).
 * @slot scope Where it looks (a <conare-scope-menu>).
 */
export declare class SearchBox extends HTMLElement {
  value: string;
  attached: Attachment[];
  label: string;
  placeholder: string;
  target: string;
  busy: boolean;
  accept: string;
  addMenu: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-search-box': SearchBox;
  }
}
