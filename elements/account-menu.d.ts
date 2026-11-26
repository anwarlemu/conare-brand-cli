/**
 * <conare-account-menu>
 * @fires open The menu opened.
 * @fires sign-out Sign out was chosen.
 */
export declare class AccountMenu extends HTMLElement {
  email: string;
  credits: { left: string; share: number; } | null;
  securityHref: string;
  signingOut: boolean;
  up: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-account-menu': AccountMenu;
  }
}
