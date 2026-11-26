export type ButtonLinkVariant = 'red' | 'secondary' | 'light' | 'ghost'
/**
 * <conare-button-link>
 * @slot (default) The label.
 */
export declare class ButtonLink extends HTMLElement {
  href: string;
  variant: ButtonLinkVariant;
  size: "sm" | "md";
  pixels: boolean;
  arrow: boolean;
  grain: boolean;
  fill?: "black" | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-button-link': ButtonLink;
  }
}
