export interface ParseSampleFile { id: string, what: string, line: string, pages: number }
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
export interface ScopeOption { name: string, documents: number, logo?: string | null }
/**
 * <conare-parse-page>
 * @fires change A file to try was picked (read `chosen`).
 * @fires file A file of your own was picked or dropped ({ file }).
 * @fires add Add to namespace was pressed ({ namespace }).
 */
export declare class ParsePage extends HTMLElement {
  samples: ParseSampleFile[];
  answer: ParseAnswer | null;
  reading: boolean;
  version: 1 | 2 | 3;
  namespaces: ScopeOption[];
  curl: string;
  own: string;
  chosen: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'conare-parse-page': ParsePage;
  }
}
