/**
 * <conare-add-documents>
 * @fires upload Files to write; detail { namespace, files }.
 * @fires paste Text to write; detail { namespace, doc: { id, text } }.
 * @fires connect The way to an app was chosen.
 * @fires browse Browse after a write; detail { namespace }.
 * @fires namespace-change The namespace was edited; detail { value }.
 */
export declare class AddDocuments extends HTMLElement {
  writing: boolean;
  notice: string;
  error: string;
  namespace: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-add-documents': AddDocuments;
  }
}
