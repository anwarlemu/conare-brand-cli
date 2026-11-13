'use client'
import { useEffect, useRef, useState } from 'react'
import { SearchRun } from '@/react/components/product/SearchRun'
import type { SearchResult } from '@/react/hooks/useSearchResults'
// The run alone, on a loop: "Searching" over the namespaces while the index flickers, then where the answer was found,
// each document a red square to point at. In the product it follows the request's real clock. It keeps the taller
// state's height, so nothing under it moves, and holds still while the pointer or focus is in it. Once the answer is in,
// Show code opens the request under the footer.
const results: SearchResult[] = [
  { namespace: 'contracts', id: 'acme-msa-2026', score: 0.94, text: 'Acme may renew for twelve months with 60 days written notice.' },
  { namespace: 'slack', id: 'legal-thread-1182', score: 0.81, text: 'Legal confirmed that Acme needs EU data residency in the renewal.' },
  { namespace: 'sales-calls', id: 'acme-oct-review', score: 0.76, text: 'Acme asked what happens to their data at renewal.' },
  { namespace: 'crm', id: 'acme-renewal-2026', score: 0.71, text: 'Renewal open. Blocker: data processing addendum for the EU region.' },
]
const namespaces = [
  { name: 'sec-filings', documents: 2184920 },
  { name: 'contracts', documents: 412830 },
  { name: 'slack', documents: 96410 },
  { name: 'crm', documents: 52660 },
  { name: 'sales-calls', documents: 2870 },
]
const code = `curl https://api.conare.ai/v1/query \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Acme renewal EU data", "top_k": 10}'`

export default function Product() {
  const [searching, setSearching] = useState(true)
  const answer = searching ? null : { results, took_ms: 312 }
  const [pointed, setPointed] = useState(false)
  const [focused, setFocused] = useState(false)
  // The loop: 600ms searching, 5s found, held while the pointer or focus is in it.
  useEffect(() => {
    if (pointed || focused) return
    const timer = setTimeout(() => setSearching(s => !s), searching ? 600 : 5000)
    return () => clearTimeout(timer)
  }, [searching, pointed, focused])
  const root = useRef<HTMLDivElement | null>(null)
  const [tallest, setTallest] = useState(0)
  useEffect(() => {
    const box = root.current?.firstElementChild
    if (!box) return
    const sizer = new ResizeObserver(() => setTallest(t => Math.max(t, box.getBoundingClientRect().height)))
    sizer.observe(box)
    return () => sizer.disconnect()
  }, [])
  return (
    <div ref={root} style={tallest ? { minHeight: `${tallest}px` } : undefined} onPointerEnter={() => setPointed(true)} onPointerLeave={() => setPointed(false)} onFocus={() => setFocused(true)} onBlur={e => setFocused(!!root.current?.contains(e.relatedTarget as Node | null))}>
      <SearchRun searching={searching} answer={answer} namespaces={namespaces} code={code} />
    </div>
  )
}
