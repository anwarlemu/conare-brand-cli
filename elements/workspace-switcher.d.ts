export interface WorkspaceGroup { id: string, name: string, role?: string, organizations: Array<{ id: string, name: string, default?: boolean }> }
/**
 * <conare-workspace-switcher>
 * @fires input Another organization was picked (read `value`).
 * @fires change Another organization was picked (read `value`).
 * @fires create New organization was chosen.
 * @slot mark The brand mark, in place of the initial tile.
 */
export declare class WorkspaceSwitcher extends HTMLElement {
  groups: WorkspaceGroup[];
  admin: boolean;
  switching?: string | undefined;
  error?: string | undefined;
  settingsHref: string;
  membersHref: string;
  value: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-workspace-switcher': WorkspaceSwitcher;
  }
}
