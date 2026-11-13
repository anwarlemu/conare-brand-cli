'use client'
import { useEffect, useRef, useState } from 'react'
import { GlideMark } from '@/react/components/visuals/GlideMark'
import { useGlideMark } from '@/react/hooks/useGlideMark'
// One block for a whole list: it glides to the row under the pointer and rests on the picked one when the pointer
// leaves, so moving down a list is one movement, not a row of flickers.
const rows = ['Queries', 'Documents', 'Indexing', 'Storage']

export default function Product() {
  const [at, setAt] = useState(0)
  const list = useRef<HTMLUListElement | null>(null)
  const { mark, instant, point, leave, settle } = useGlideMark(list, () => at)
  useEffect(() => settle(), [at, settle])
  return (
    <ul ref={list} className="relative w-105 max-w-full border border-edge bg-surface" onPointerLeave={leave}>
      <GlideMark mark={mark} instant={instant} />
      {rows.map((r, i) => (
        <li key={r} data-glide-row className="relative z-1 border-edge not-first:border-t">
          <button
            type="button"
            className="relative flex min-h-row w-full cursor-pointer items-center gap-4 pr-4 pl-5 text-left type-ui before:absolute before:top-1/2 before:left-2 before:-mt-0.5 before:size-1 before:bg-edge-accent before:opacity-0 before:transition-opacity before:duration-120 before:ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-accent data-on:before:opacity-100"
            data-on={at === i || undefined}
            aria-pressed={at === i}
            onPointerEnter={() => point(i)}
            onFocus={() => point(i)}
            onClick={() => setAt(i)}
          >
            <span className="min-w-0 flex-1 truncate">{r}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
