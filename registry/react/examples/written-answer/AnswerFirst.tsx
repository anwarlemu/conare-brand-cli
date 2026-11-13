'use client'
import { useState } from 'react'
import { SearchResults } from '@/react/components/product/SearchResults'
import { WrittenAnswer } from '@/react/components/product/WrittenAnswer'
import type { SearchResult } from '@/react/hooks/useSearchResults'
// Answer first: the written answer by itself above the passages. Press a citation and its result opens below.
const query = 'Acme renewal EU data'
const results: SearchResult[] = [
  { namespace: 'contracts', id: 'acme-msa-2026', score: 0.94, page: { number: 9, count: 24, top: 0.3, file: 'acme-msa-2026.pdf' }, text: 'Acme may renew for twelve months with 60 days written notice. On renewal, all customer data stays in the EU region named in Schedule C.' },
  { namespace: 'contracts', id: 'acme-dpa-2025', score: 0.83, page: { number: 3, count: 11, top: 0.6, file: 'acme-dpa-2025.pdf' }, text: 'Schedule C names Frankfurt as the region where Acme customer data is stored and processed.' },
  { namespace: 'slack', id: 'legal-thread-1182', score: 0.81, text: 'Legal confirmed that Acme needs EU data residency in the renewal, and that Schedule C covers it.' },
  { namespace: 'crm', id: 'acme-renewal-2026', score: 0.71, text: 'Renewal open. Blocker: data processing addendum for the EU region.' },
]
const text = 'Acme can renew for twelve months with 60 days written notice [1]. Its data stays in the EU region named in Schedule C, which is Frankfurt [2][3]. The open blocker is the data processing addendum [4].'

export default function AnswerFirst() {
  const [reveal, setReveal] = useState<{ key: string, at: number } | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <WrittenAnswer mode="first" results={results} text={text} onCite={key => setReveal({ key, at: Date.now() })} />
      <SearchResults results={results} query={query} reveal={reveal} />
    </div>
  )
}
