export interface Install { label: string, href: string }
/**
 * <conare-agent-split>
 * @fires copied The prompt was copied.
 * @fires install An install was chosen; detail.value is its label.
 */
export declare class AgentSplit extends HTMLElement {
  prompt: string;
  installs: Install[];
  large: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-agent-split': AgentSplit;
  }
}
