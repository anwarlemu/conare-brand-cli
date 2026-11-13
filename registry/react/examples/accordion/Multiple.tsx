'use client'
import { useState } from 'react'
import { Accordion, type AccordionValue } from '@/react/components/ui/Accordion'
import { AccordionItem } from '@/react/components/ui/AccordionItem'
// Several open at once, for a checklist the person works down.

export default function Multiple() {
  const [open, setOpen] = useState<AccordionValue>(['keys'])
  return (
    <div className="max-w-[560px]">
      <Accordion value={open} onValueChange={setOpen} multiple>
        <AccordionItem value="keys" title="Create an API key">Settings, then API keys. Copy it once: it is not shown again.</AccordionItem>
        <AccordionItem value="source" title="Connect a source">Pick an app and sign in. Its documents start syncing into a namespace.</AccordionItem>
        <AccordionItem value="search" title="Run a search">Ask a question in plain words. The best match comes first, with its source.</AccordionItem>
      </Accordion>
    </div>
  )
}
