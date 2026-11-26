export interface Suggestion { q: string, ns: string, logo?: string }
/**
 * <conare-suggestion-chips>
 * @fires ask A chip was picked; detail is the suggestion { q, ns, logo }.
 */
export declare class SuggestionChips extends HTMLElement {
  items: Suggestion[];
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-suggestion-chips': SuggestionChips;
  }
}
