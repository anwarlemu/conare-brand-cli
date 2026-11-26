export type Logo = { name: string, mark?: boolean }
/**
 * <conare-logo-strip>

 */
export declare class LogoStrip extends HTMLElement {
  heading: string;
  tag?: string | undefined;
  logos: Logo[];
  titleId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-logo-strip': LogoStrip;
  }
}
