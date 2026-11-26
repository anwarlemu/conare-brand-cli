export interface ParsePart { page: number, markdown: string, ocr: boolean, confidence: number | null, blocks: ParseBlock[] }
export interface ParseBlock { type: string, bbox: [number, number, number, number], order: number, content: string, conf: number | null }
/**
 * <conare-parse-sheet>
 * @fires point The pointer is on a region ({ order }) or left it ({ order: null }).
 * @fires pick A region was clicked ({ order }).
 */
export declare class ParseSheet extends HTMLElement {
  parsed: ParsePart;
  scan: boolean;
  on: number | null;
  mini: boolean;
  plays: boolean;
  all: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-parse-sheet': ParseSheet;
  }
}
