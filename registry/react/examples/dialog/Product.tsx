'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Dialog } from '@/react/components/ui/Dialog'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
// The new-organization dialog, opened as the frame loads; close it and the button opens it again. Opening with the
// page, focus rests on the window itself, so nothing shows selected until someone reaches for it.

export default function Product() {
  const [open, setOpen] = useState(false)
  const first = useRef(true)
  useEffect(() => setOpen(true), [])
  // Once it has opened (and put focus in its field), focus rests on the window itself.
  useEffect(() => {
    if (!open || !first.current) return
    first.current = false
    document.querySelector<HTMLElement>('dialog[open]')?.focus()
  }, [open])
  return (
    <div className="min-h-105">
      <Button onClick={() => setOpen(true)}>New organization</Button>
      <Dialog open={open} onOpenChange={setOpen} title="New organization">
        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setOpen(false) }}>
          <Field label="Name">
            {({ id }) => <Input id={id} placeholder="Legal team" />}
          </Field>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="dark" type="submit">Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
