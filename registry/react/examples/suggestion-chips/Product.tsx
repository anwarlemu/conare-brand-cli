'use client'
import { useState } from 'react'
import { SuggestionChips, type Suggestion } from '@/react/components/product/SuggestionChips'
// Questions to start from, each ending on the namespace that answers it. Point at them: one block glides along.
const items: Suggestion[] = [
  { q: 'notice period to terminate a contract', ns: 'contracts' },
  { q: 'breach notification window', ns: 'slack' },
  { q: 'cash on hand last quarter', ns: 'sec-filings' },
]

export default function Product() {
  const [asked, setAsked] = useState('')
  return (
    <div className="flex flex-col items-center gap-4">
      <SuggestionChips items={items} onAsk={s => setAsked(`Searching ${s.ns} for: ${s.q}`)} />
      <p className="min-h-4 type-meta text-fg-muted" role="status">{asked}</p>
    </div>
  )
}
