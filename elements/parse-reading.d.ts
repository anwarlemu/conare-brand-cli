export interface ParseAnswer {
	id: string
	name: string
	/** The page shown, and how many the file has. */
	page: number
	pages: number
	took_ms: number
	/** A scanned page (drawn as a scan). */
	scan?: boolean
	markdown: string
	/** What a plain PDF reader gets from the same page; empty for a scan. */
	plain: string
	part: ParsePart
}
export interface ParsePart { page: number, markdown: string, ocr: boolean, confidence: number | null, blocks: ParseBlock[] }
export interface ParseBlock { type: string, bbox: [number, number, number, number], order: number, content: string, conf: number | null }
/**
 * <conare-parse-reading>

 */
export declare class ParseReading extends HTMLElement {
  answer?: ParseAnswer | undefined;
  version: 1 | 2 | 3;
  rootName: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-parse-reading': ParseReading;
  }
}
