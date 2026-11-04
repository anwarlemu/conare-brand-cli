import { computed, ref } from 'vue'

/**
 * A document as Conare read it (POST /parse?layout=true): every region with its box (shares of the page), its reading
 * order and its OCR confidence. The parse views draw it; useParsePoint() joins the page and the text, so pointing at a
 * region on one lights it on the other and a click pins it.
 */
export interface ParseBlock { type: string, bbox: [number, number, number, number], order: number, content: string, conf: number | null }
export interface ParsePart { page: number, markdown: string, ocr: boolean, confidence: number | null, blocks: ParseBlock[] }
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

/** A region's kind in plain words. */
export const REGION: Record<string, string> = { title: 'Title', text: 'Text', list: 'List', table: 'Table', image: 'Image', header: 'Header', footer: 'Footer', footnote: 'Footnote' }

/** A Markdown table's cells: its head, then its rows. */
export function tableOf(content: string) {
  const lines = content.split('\n').filter(l => l.trim().startsWith('|'))
  const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  return { head: lines[0] ? cells(lines[0]) : [], rows: lines.slice(2).map(cells) }
}

/** Totals read heavier on the page and in the text. */
export const isTotal = (label: string) => /^(total|net earnings)/i.test(label)

/** The region pointed at or pinned. */
export function useParsePoint() {
  const on = ref<number | null>(null)
  const pinned = ref<number | null>(null)
  const lit = computed(() => on.value ?? pinned.value)
  const pick = (order: number) => { pinned.value = pinned.value === order ? null : order }
  return { on, pinned, lit, pick }
}
