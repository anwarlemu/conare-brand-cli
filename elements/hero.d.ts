/**
 * <conare-hero>
 * @fires input A tab was picked (read `value`).
 * @fires change A tab was picked (read `value`).
 * @slot title The headline drawn as you like, in place of the revealed heading.
 * @slot action The one action: a button-link.
 * @slot window The window in the frame (show the picked tab's: read `value`).
 */
export declare class Hero extends HTMLElement {
  eyebrow?: string | undefined;
  heading: string;
  accent: string;
  body?: string | undefined;
  tabs: { label: string; mark?: string; }[];
  tabsLabel: string;
  turn: number;
  value: number;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-hero': Hero;
  }
}
