'use client'
import { useState } from 'react'
import { Field } from '@/react/components/ui/Field'
import { Textarea } from '@/react/components/ui/Textarea'
// Pasting text into a namespace, with a count under it, and the same field when it is too long.

export default function Product() {
  const [text, setText] = useState('')
  const [long, setLong] = useState('Refunds are available for 30 days after purchase. '.repeat(3))
  const tooLong = long.length > 120
  return (
    <div className="flex w-120 max-w-full flex-col gap-6">
      <Field label="Text" hint={`${text.length} of 20,000 characters`}>
        {({ id, hintId }) => <Textarea id={id} value={text} onChange={e => setText(e.target.value)} aria-describedby={hintId} placeholder="Refunds are available for 30 days after purchase." />}
      </Field>
      <Field label="Summary" error={tooLong ? `Keep it under 120 characters (${long.length} now).` : undefined} hint="Shown under the namespace's name.">
        {({ id, hintId }) => <Textarea id={id} value={long} onChange={e => setLong(e.target.value)} rows={3} invalid={tooLong} aria-describedby={hintId} />}
      </Field>
    </div>
  )
}
