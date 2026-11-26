/**
 * <conare-roll-text>

 */
export declare class RollText extends HTMLElement {
  text: string;
  pace: "console" | "site";
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-roll-text': RollText;
  }
}
