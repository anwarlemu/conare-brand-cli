/**
 * <conare-announcement-bar>

 */
export declare class AnnouncementBar extends HTMLElement {
  tag: string;
  text: string;
  cta?: string | undefined;
  href: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-announcement-bar': AnnouncementBar;
  }
}
