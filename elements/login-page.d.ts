export type LoginError = 'expired' | 'cancelled' | 'unavailable' | 'failed' | 'private'
/**
 * <conare-login-page>

 */
export declare class LoginPage extends HTMLElement {
  error?: string | undefined;
  heading: string;
  signInHref: string;
  demoHref: string;
  requestHref?: string | undefined;
  full: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-login-page': LoginPage;
  }
}
