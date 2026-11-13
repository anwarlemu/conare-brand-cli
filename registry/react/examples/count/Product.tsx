'use client'
import { useEffect, useState } from 'react'
import { Count } from '@/react/components/ui/Count'
// The count climbs by itself, as a syncing source's documents do between polls.

export default function Product() {
  const [documents, setDocuments] = useState(412830)
  useEffect(() => {
    const timer = setInterval(() => setDocuments(d => d + 1240), 2000)
    return () => clearInterval(timer)
  }, [])
  return (
    <p className="text-heading-4 font-medium"><Count value={documents} /> <span className="type-meta font-normal text-fg-muted">documents</span></p>
  )
}
