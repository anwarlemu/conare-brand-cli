/**
 * <conare-drawer>
 * @fires open-change It opened or closed (detail.value; read `open`).
 * @slot (default) The panel's content.
 */
export declare class Drawer extends HTMLElement {
  heading: string;
  side: "right" | "bottom" | "left";
  bar: boolean;
  open: boolean;
  close(): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-drawer': Drawer;
  }
}
