// What the search's parts share (SearchResults, SearchRun, WrittenAnswer): the result's shape, the query's words
// marked in a passage, and a written answer split at its citations.

/** The page a passage stands on, for results from PDF and Word documents: `top` is where on the page (0 to 1). */
export type ResultPage = { number: number, count: number, top: number, file: string }

/** One passage a search found. */
export type SearchResult = { namespace: string, id: string, score: number, text: string, page?: ResultPage }

/**
 * A passage split into runs, each marked when it is one of the query's words, so the eye lands on why a passage
 * matched. Words of three letters or fewer ("a", "the", "to") don't count.
 */
export function marks(text: string, query: string): Array<{ text: string, hit: boolean }> {
  const words = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [])]
  if (!words.length) return [{ text, hit: false }]
  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'giu')
  return text.split(pattern).filter(Boolean).map(part => ({ text: part, hit: words.includes(part.toLowerCase()) }))
}

/** A written answer that marks its sources [1], [2], as words and citation numbers. */
export function citeParts(text: string): Array<{ words: string } | { cite: number }> {
  return text.split(/(\[\d+\])/).filter(Boolean).map(p => (/^\[\d+\]$/.test(p) ? { cite: Number(p.slice(1, -1)) } : { words: p }))
}

/** A result's key, unique across namespaces. */
export const resultKey = (r: SearchResult) => `${r.namespace}/${r.id}`
