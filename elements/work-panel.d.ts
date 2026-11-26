/**
 * <conare-work-panel>
 * @slot (default) The action: one large pixel button, secondary buttons beside it.
 * @slot window The one window on the panel.
 */
export declare class WorkPanel extends HTMLElement {
  heading: string;
  line?: string | undefined;
  seed: number;
  tall: boolean;
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-work-panel': WorkPanel;
  }
}
