/**
 * <conare-testimonial>

 */
export declare class Testimonial extends HTMLElement {
  quote: string;
  jobTitle: string;
  company: string;
  tag: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-testimonial': Testimonial;
  }
}
