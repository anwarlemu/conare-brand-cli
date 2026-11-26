export type PromptTemplate = { label: string, icon: 'phone' | 'mail' | Pattern, answer?: string, more?: string, href?: string }
export type Pattern = 'dots' | 'hatch' | 'checker' | 'ruling' | 'columns' | 'grid'
export type PromptWords = { ask: string, readMore: string, clear: string, close: string, fallback: string, fallbackLink: string }
/**
 * <conare-prompt-bar>
 * @fires ask A question was asked; detail { question }.
 */
export declare class PromptBar extends HTMLElement {
  phrases: string[];
  templates: PromptTemplate[];
  href: string;
  label: string;
  docked: boolean;
  voice: boolean;
  shortcuts: boolean;
  words: PromptWords;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-prompt-bar': PromptBar;
  }
}
