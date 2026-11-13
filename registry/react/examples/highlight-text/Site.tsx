'use client'
import { useEffect, useState } from 'react'
import { HighlightText } from '@/react/components/visuals/HighlightText'
// The hero's heading as the website draws it. Here it plays again every few seconds; on the website it plays once.

export default function Site() {
  const [round, setRound] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setRound(r => r + 1), 4000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="flex flex-col items-center text-center">
      <HighlightText key={round} as="h1" text="Search any data you bring" accent="." className="type-hero sm:type-display" />
    </div>
  )
}
