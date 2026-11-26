export interface MenubarEntry extends HTMLElement { focusTrigger(): void, openMenu(focus?: 'first' | 'last' | 'none'): Promise<void> }
/**
 * <conare-menubar>
 * @slot (default) The menus: <conare-menubar-menu>.
 */
export declare class Menubar extends HTMLElement {
  label: string;
  active: Element | null;
  focused: Element | null;
  entries(): MenubarEntry[];
  current(): Element;
  setActive(menu: Element | null): void;
  setFocused(menu: Element): void;
  move(from: Element, step: number, open: boolean): void;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-menubar': Menubar;
  }
}
