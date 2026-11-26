export interface Crumb { label: string, href?: string, mono?: boolean }
/**
 * <conare-breadcrumb>
 * @fires navigate A step back was clicked (detail.crumb, detail.event).
 */
export declare class Breadcrumb extends HTMLElement {
  items: Crumb[];
  label: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-breadcrumb': Breadcrumb;
  }
}
