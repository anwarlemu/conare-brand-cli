'use client'
import { useState } from 'react'
import { ToggleGroup } from '@/react/components/ui/ToggleGroup'
// Kinds of document a search may return, several at once; and a single pick that can be let go.

export default function Product() {
  const [kinds, setKinds] = useState<string[] | string | null>(['Pages', 'Files'])
  const [weight, setWeight] = useState<string[] | string | null>('Recent first')
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">Several</p>
      <div><ToggleGroup value={kinds} onValueChange={setKinds} multiple label="kinds of document" options={['Messages', 'Pages', 'Emails', 'Files']} /></div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">One or none</p>
      <div><ToggleGroup value={weight} onValueChange={setWeight} label="ordering" options={['Recent first', 'Most cited']} /></div>
    </div>
  )
}
