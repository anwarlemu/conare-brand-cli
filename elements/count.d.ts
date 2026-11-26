/**
 * <conare-count>

 */
export declare class Count extends HTMLElement {
  value: number;
  rolls: boolean;
  once?: string | undefined;
  format?: ((n: number) => string) | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-count': Count;
  }
}
