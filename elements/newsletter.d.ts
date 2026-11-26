/**
 * <conare-newsletter>
 * @fires submit The form was sent; detail is the email address.
 */
export declare class Newsletter extends HTMLElement {
  heading: string;
  tag?: string | undefined;
  body?: string | undefined;
  label: string;
  action: string;
  sent: boolean;
  sentText: string;
  sending: boolean;
  error?: string | undefined;
  titleId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-newsletter': Newsletter;
  }
}
