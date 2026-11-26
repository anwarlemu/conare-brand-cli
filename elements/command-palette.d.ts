export interface PaletteLink { id?: string, label: string, icon?: string, href?: string }
export interface PaletteNamespace { name: string, documents: number, logo?: string | null }
export interface PaletteDocument { id: string, namespace?: string, text?: string, logo?: string | null }
/**
 * <conare-command-palette>
 * @fires query The text changed (detail.value, trimmed).
 * @fires select A row was run (detail.pick).
 * @fires open-change It opened or closed (detail.value).
 * @slot mark The brand mark in the dark window's title bar.
 */
export declare class CommandPalette extends HTMLElement {
  pages: PaletteLink[];
  actions: PaletteLink[];
  namespaces: PaletteNamespace[];
  documents: PaletteDocument[];
  searching: boolean;
  tone: "dark" | "light";
  heading: string;
  placeholder: string;
  open: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-command-palette': CommandPalette;
  }
}
