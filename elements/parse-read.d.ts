export interface ParsePart { page: number, markdown: string, ocr: boolean, confidence: number | null, blocks: ParseBlock[] }
export interface ParseBlock { type: string, bbox: [number, number, number, number], order: number, content: string, conf: number | null }
/**
 * <conare-parse-read>
 * @fires point A region took the pointer or focus ({ order }) or lost it ({ order: null }).
 * @fires pick A region was clicked ({ order }).
 */
export declare class ParseRead extends HTMLElement {
  parsed: ParsePart;
  on: number | null;
  plays: boolean;
  tight: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-parse-read': ParseRead;
  }
}
