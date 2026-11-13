'use client'
import { useState } from 'react'
import { Resizable } from '@/react/components/ui/Resizable'
// A page and its docs side by side, the hairline between them: drag it, or focus it and use the arrow keys.

export default function Product() {
  const [share, setShare] = useState(62)
  return (
    <div className="flex flex-col gap-2">
      <Resizable
        value={share}
        onValueChange={setShare}
        className="h-72 border border-edge"
        label="resize the docs panel"
        min={30}
        max={80}
        first={(
          <div className="flex flex-col gap-1 p-4">
            <h3 className="type-heading-3">Search</h3>
            <p className="type-meta text-fg-muted">Ask a question of the contracts namespace.</p>
          </div>
        )}
        second={(
          <>
            <div className="flex h-12 items-center border-b border-edge px-4 type-ui-strong">Docs</div>
            <p className="p-4 type-ui text-fg-soft">Search returns the passages that answer a question, best first, each with its source.</p>
          </>
        )}
      />
      <p className="type-meta text-fg-muted tabular-nums">Page {Math.round(share)}%, docs {100 - Math.round(share)}%</p>
    </div>
  )
}
