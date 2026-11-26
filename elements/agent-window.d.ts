/**
 * <conare-agent-window>
 * @slot mark Replaces the brand mark in the window's bar.
 */
export declare class AgentWindow extends HTMLElement {
  heading: string;
  tag: string;
  ask: string;
  answer: string;
  tool: string;
  source: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-agent-window': AgentWindow;
  }
}
