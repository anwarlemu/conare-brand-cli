'use client'
import { useState } from 'react'
import { SplitBar } from '@/react/components/ui/SplitBar'
// A whole in parts, as Billing's prices draw it: one bar, the largest part first, a red mark over the part the row
// pointed at names, and one block gliding down the rows.
const usd = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const parts = [
  { name: 'Queries', detail: '$1.00 per 1,000 queries', value: 18431 },
  { name: 'Documents', detail: '$1.00 per 1,000 pages', value: 4821 },
  { name: 'Indexing', detail: '$0.05 per 1M tokens', value: 1928 },
  { name: 'Storage', detail: '$0.33 per GB a month', value: 268 },
].map(p => ({ ...p, display: usd(p.value) }))

export default function Split() {
  const [at, setAt] = useState(0)
  return <SplitBar value={at} onValueChange={setAt} parts={parts} label="This month's bill by part" />
}
