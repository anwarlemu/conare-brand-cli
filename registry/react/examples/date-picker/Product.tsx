'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { DatePicker } from '@/react/components/ui/DatePicker'
import { Field } from '@/react/components/ui/Field'
// When a new API key stops working: a date in a field, from tomorrow on.

export default function Product() {
  const [until, setUntil] = useState<Date | null>(null)
  const [tomorrow] = useState(() => new Date(new Date().setDate(new Date().getDate() + 1)))
  return (
    <form className="flex min-h-100 max-w-80 flex-col gap-4" onSubmit={e => e.preventDefault()}>
      <Field label="Expires" hint="The key stops working at the start of this day.">
        {({ id }) => <DatePicker id={id} value={until} onValueChange={setUntil} min={tomorrow} placeholder="Never" />}
      </Field>
      <div><Button variant="dark" type="submit">Create key</Button></div>
    </form>
  )
}
