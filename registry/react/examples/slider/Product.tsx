'use client'
import { useState } from 'react'
import { Slider } from '@/react/components/ui/Slider'
// How many passages a search returns, and a minimum score: the value beside each in tabular figures.

export default function Product() {
  const [topK, setTopK] = useState(8)
  const [score, setScore] = useState(40)
  return (
    <div className="flex w-90 max-w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between type-meta"><span className="text-fg-soft">Passages per search</span><span className="tabular-nums">{topK}</span></div>
        <Slider value={topK} onValueChange={setTopK} label="passages per search" min={1} max={20} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between type-meta"><span className="text-fg-soft">Minimum score</span><span className="tabular-nums">{(score / 100).toFixed(2)}</span></div>
        <Slider value={score} onValueChange={setScore} label="minimum score" valueText={(score / 100).toFixed(2)} step={5} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between type-meta"><span className="text-fg-muted">Rerank depth (on the Scale plan)</span><span className="tabular-nums text-fg-muted">50</span></div>
        <Slider value={50} label="rerank depth" disabled />
      </div>
    </div>
  )
}
