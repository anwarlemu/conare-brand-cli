export interface Install { label: string, href: string }
/**
 * <conare-agent-prompt>
 * @fires copied The prompt was copied.
 * @fires install An install was chosen; detail.value is its label.
 */
export declare class AgentPrompt extends HTMLElement {
  prompt: string;
  code: string;
  installs: Install[];
  heading: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-agent-prompt': AgentPrompt;
  }
}
