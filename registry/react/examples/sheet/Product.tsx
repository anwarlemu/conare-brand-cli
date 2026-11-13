'use client'
import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { CodeBlock } from '@/react/components/ui/CodeBlock'
import { Sheet } from '@/react/components/ui/Sheet'
// The docs beside the console: a page's help opens in a sheet at the right edge, with the call to make. Escape or the
// dimmed page closes it.
const code = `curl https://api.acme.dev/v1/namespaces/contracts/query \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{ "query": "notice period", "top_k": 5 }'`

export default function Product() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Button onClick={() => setOpen(true)}><BookOpen size={12} strokeWidth={1.5} aria-hidden="true" />Docs</Button>
      <Sheet open={open} onOpenChange={setOpen} title="Search a namespace" description="Send a question and get back the passages that answer it, best first.">
        <div className="flex flex-col gap-4">
          <p className="type-ui text-fg-soft">Name the namespace in the path. <span className="type-code-sm text-fg">top_k</span> sets how many passages come back, 5 by default.</p>
          <CodeBlock code={code} label="Request" />
          <h3 className="type-heading-4">What comes back</h3>
          <p className="type-ui text-fg-soft">Each passage has its document's ID, the text and a score between 0 and 1. Results under 0.3 are left out.</p>
        </div>
      </Sheet>
    </div>
  )
}
