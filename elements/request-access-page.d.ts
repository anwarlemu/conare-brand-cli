export type AccessState = 'loading' | 'signed-out' | 'failed' | 'form' | 'sent'
/**
 * <conare-request-access-page>
 * @fires submit The form was sent; detail is the answers (name, company, teamSize, useCase).
 * @fires retry Try again was pressed after a failed load.
 * @fires edit Change your answers was pressed.
 */
export declare class RequestAccessPage extends HTMLElement {
  state: AccessState;
  email?: string | undefined;
  personalEmail: boolean;
  name?: string | undefined;
  teamSizes: string[];
  sending: boolean;
  error?: string | undefined;
  heading: string;
  homeHref: string;
  demoHref: string;
  signInHref: string;
  privacyHref: string;
  supportEmail: string;
  full: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-request-access-page': RequestAccessPage;
  }
}
