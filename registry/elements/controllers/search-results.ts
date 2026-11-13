// What the search's parts share (SearchResults, SearchRun, WrittenAnswer): the result's shape and a written answer
// split at its citations. The query's words are marked by MarkedText.

/** The page a passage stands on, for results from PDF and Word documents: `top` is where on the page (0 to 1). */
export type ResultPage = { number: number, count: number, top: number, file: string }

/** One passage a search found. */
export type SearchResult = { namespace: string, id: string, score: number, text: string, page?: ResultPage }

/** A written answer that marks its sources [1], [2], as words and citation numbers. */
export function citeParts(text: string): Array<{ words: string } | { cite: number }> {
	return text.split(/(\[\d+\])/).filter(Boolean).map(p => (/^\[\d+\]$/.test(p) ? { cite: Number(p.slice(1, -1)) } : { words: p }))
}

/** A result's key, unique across namespaces. */
export const resultKey = (r: SearchResult) => `${r.namespace}/${r.id}`
