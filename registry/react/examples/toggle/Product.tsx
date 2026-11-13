'use client'
import { useState } from 'react'
import { Toggle } from '@/react/components/ui/Toggle'
// Options that stay on, as the spend cap's chips do: a red square at the start and an ink edge while on.

export default function Product() {
  const [exact, setExact] = useState(true)
  const [archived, setArchived] = useState(false)
  const [mine, setMine] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="search options">
      <Toggle pressed={exact} onPressedChange={setExact}>Exact words</Toggle>
      <Toggle pressed={archived} onPressedChange={setArchived}>Include archived</Toggle>
      <Toggle pressed={mine} onPressedChange={setMine}>Only mine</Toggle>
      <Toggle disabled>Shared drives</Toggle>
    </div>
  )
}
