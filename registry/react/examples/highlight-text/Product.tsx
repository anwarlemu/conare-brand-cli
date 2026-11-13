'use client'
import { useEffect, useState } from 'react'
import { HighlightText } from '@/react/components/visuals/HighlightText'
// The reveal in the console, as Explorer's headline has it. Here it plays again every few seconds; in the product it
// plays once.

export default function Product() {
  const [round, setRound] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setRound(r => r + 1), 4000)
    return () => clearInterval(timer)
  }, [])
  return <HighlightText key={round} as="h1" text="Explore your data" accent="." className="text-center type-heading-1 md:type-hero" />
}
