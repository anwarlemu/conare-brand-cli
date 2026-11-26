export type SettingsMember = { email: string, role: string, joined: string, invited?: boolean }
export type SignInOption = { id: string, label: string, description: string, on: boolean }
export type SettingsPart = 'general' | 'members' | 'sign-in'
/**
 * <conare-settings-page>
 * @fires change The tab changed (read `pane`).
 * @fires rename The company's name was saved; detail is the name.
 * @fires invite Invite members was pressed.
 * @fires remove Remove was pressed on a member; detail is the member.
 * @fires toggle A way in was turned; detail is { id, on }.
 * @fires sign-out Sign out was pressed.
 */
export declare class SettingsPage extends HTMLElement {
  company: { name: string; id: string; joined: string; };
  members: SettingsMember[];
  signIn: SignInOption[];
  email: string;
  pane: SettingsPart;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-settings-page': SettingsPage;
  }
}
