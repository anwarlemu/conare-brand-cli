export type BentoCell = { title: string, body: string, size?: 'large' | 'wide' | 'tall' }
/**
 * <conare-bento>

 */
export declare class Bento extends HTMLElement {
  heading: string;
  tag?: string | undefined;
  body?: string | undefined;
  cells: BentoCell[];
  titleId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-bento': Bento;
  }
}
