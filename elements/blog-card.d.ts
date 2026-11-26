/**
 * <conare-blog-card>
 * @slot window A 520 by 380 window that plays once the card is on screen (it gets `active`).
 */
export declare class BlogCard extends HTMLElement {
  href: string;
  heading: string;
  dek?: string | undefined;
  category: string;
  author?: string | undefined;
  date?: string | undefined;
  seed?: number | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-blog-card': BlogCard;
  }
}
