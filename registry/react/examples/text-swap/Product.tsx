'use client'
import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { TextSwap } from '@/react/components/visuals/TextSwap'
// Two labels in one cell, so nothing around them moves: the first leaves up, the next arrives from below, each with a
// touch of blur, and a check draws itself. Here it swaps by itself.

export default function Product() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const timer = setInterval(() => setOn(v => !v), 1800)
    return () => clearInterval(timer)
  }, [])
  return (
    <TextSwap
      on={on}
      className="text-ui"
      a={<><Copy size={12} strokeWidth={1.5} aria-hidden="true" />Copy prompt</>}
      b={<><Check size={12} strokeWidth={2} aria-hidden="true" />Copied</>}
    />
  )
}
