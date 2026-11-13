'use client'
import { useState } from 'react'
import { Collapsible } from '@/react/components/ui/Collapsible'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { Switch } from '@/react/components/ui/Switch'
// A new source's form with its advanced settings folded away: open them and the form below moves down to make room.

export default function Product() {
  const [name, setName] = useState('Acme drive')
  const [open, setOpen] = useState(false)
  const [ocr, setOcr] = useState(true)
  const [every, setEvery] = useState('60')
  return (
    <form className="flex max-w-100 flex-col gap-4" onSubmit={e => e.preventDefault()}>
      <Field label="Name">
        {({ id }) => <Input id={id} value={name} onChange={e => setName(e.target.value)} />}
      </Field>
      <div className="border-y border-edge">
        <Collapsible open={open} onOpenChange={setOpen} trigger="Advanced settings">
          <div className="flex flex-col gap-4 pt-1 pb-4">
            <Field label="Sync every" hint="In minutes, 15 at least.">
              {({ id, hintId }) => <Input id={id} value={every} onChange={e => setEvery(e.target.value)} inputMode="numeric" aria-describedby={hintId} />}
            </Field>
            <div className="flex items-center justify-between gap-4">
              <span className="type-meta text-fg-soft">Read text in scanned pages</span>
              <Switch checked={ocr} onCheckedChange={setOcr} label="read text in scanned pages" />
            </div>
          </div>
        </Collapsible>
      </div>
      <p className="type-meta text-fg-muted">Documents start syncing as soon as you connect.</p>
    </form>
  )
}
