'use client'
import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { Popover } from '@/react/components/ui/Popover'
import { Switch } from '@/react/components/ui/Switch'
// A search's settings in a popover: how many results, and whether to rerank. Focus moves into the panel as it opens;
// Escape closes it and returns to the button.

export default function Product() {
  const [topK, setTopK] = useState('5')
  const [rerank, setRerank] = useState(true)
  return (
    <div className="flex min-h-72 items-start justify-center">
      <Popover label="search settings" align="end" trigger={<><SlidersHorizontal size={12} strokeWidth={1.5} aria-hidden="true" />Settings</>}>
        {close => (
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); close() }}>
            <p className="type-ui-strong">Search settings</p>
            <Field label="Results" hint="Between 1 and 50.">
              {({ id }) => <Input id={id} value={topK} onChange={e => setTopK(e.target.value)} inputMode="numeric" />}
            </Field>
            <div className="flex items-center justify-between gap-4">
              <span className="type-meta text-fg-soft">Rerank results</span>
              <Switch checked={rerank} onCheckedChange={setRerank} label="rerank results" />
            </div>
            <div className="flex justify-end"><Button variant="dark" type="submit">Save</Button></div>
          </form>
        )}
      </Popover>
    </div>
  )
}
