export type ProductVizId = 'search' | 'sync' | 'parse' | 'embed' | 'rerank'
/**
 * <conare-product-viz>
 * @slot title What the bar says after the mark.
 * @slot (default) The window's body.
 */
export declare class ProductViz extends HTMLElement {
  product: ProductVizId;
  size: "sm" | "md";
  active: boolean;
  stretch: boolean;
  relative: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-product-viz': ProductViz;
  }
}
