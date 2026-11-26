/**
 * <conare-table>
 * @slot (default) A <table> with its <thead> and <tbody>.
 */
export declare class Table extends HTMLElement {
  variant: "product" | "settings";
  framed: boolean;
  label?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-table': Table;
  }
}
