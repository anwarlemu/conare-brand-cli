/**
 * <conare-fact>
 * @slot (default) The value, in place of `value`.
 */
export declare class Fact extends HTMLElement {
  name: string;
  value?: string | undefined;
  mono: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-fact': Fact;
  }
}
