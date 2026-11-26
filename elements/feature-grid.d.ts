export type Feature = { title: string, body: string }
/**
 * <conare-feature-grid>

 */
export declare class FeatureGrid extends HTMLElement {
  heading: string;
  tag?: string | undefined;
  body?: string | undefined;
  features: Feature[];
  titleId: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-feature-grid': FeatureGrid;
  }
}
