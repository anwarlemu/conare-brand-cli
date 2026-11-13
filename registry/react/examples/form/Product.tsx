'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Checkbox } from '@/react/components/ui/Checkbox'
import { Field } from '@/react/components/ui/Field'
import { Form } from '@/react/components/ui/Form'
import { Input } from '@/react/components/ui/Input'
import { NativeSelect } from '@/react/components/ui/NativeSelect'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { useForm } from '@/react/hooks/useForm'
// Creating an API key: a name, where it can search and when it expires. Send it empty to see the errors; a name of
// "taken" shows the server's answer.

export default function Product() {
  const [created, setCreated] = useState('')
  const { values, set, errors, sending, failure, touch, submit, reset } = useForm(
    { name: '', namespace: '', expires: '90', readOnly: true },
    {
      name: v => (!String(v).trim() ? 'Give the key a name.' : /\s/.test(String(v)) ? 'Use letters, numbers and dashes, no spaces.' : undefined),
      namespace: v => (!v ? 'Pick where it can search.' : undefined),
    },
  )
  function send() {
    void submit(async (v) => {
      await new Promise(resolve => setTimeout(resolve, 800))
      if (v.name === 'taken') throw new Error('A key with that name already exists.')
      setCreated(v.name)
    })
  }
  return (
    <div className="w-100 max-w-full">
      {!created
        ? (
            <Form
              label="create an API key"
              failure={failure}
              onSubmit={send}
              actions={(
                <>
                  <Button variant="ghost" onClick={reset}>Clear</Button>
                  <PixelButton type="submit" disabled={sending}>{sending ? 'Creating' : 'Create key'}</PixelButton>
                </>
              )}
            >
              <Field label="Name" hint="Letters, numbers and dashes." error={errors.name}>
                {({ id, hintId }) => <Input id={id} value={values.name} onChange={e => set('name', e.target.value)} invalid={!!errors.name} aria-describedby={hintId} autoComplete="off" placeholder="production-agent" onBlur={() => touch('name')} />}
              </Field>
              <Field label="Namespace" error={errors.namespace}>
                {({ id, hintId }) => (
                  <NativeSelect id={id} value={values.namespace} onChange={e => set('namespace', e.target.value)} mono invalid={!!errors.namespace} aria-describedby={hintId} onBlur={() => touch('namespace')}>
                    <option value="" disabled>Pick a namespace</option><option>contracts</option><option>slack</option><option>sec-filings</option>
                  </NativeSelect>
                )}
              </Field>
              <Field label="Expires">
                {({ id }) => <NativeSelect id={id} value={values.expires} onChange={e => set('expires', e.target.value)}><option value="30">In 30 days</option><option value="90">In 90 days</option><option value="never">Never</option></NativeSelect>}
              </Field>
              <Checkbox checked={values.readOnly} onCheckedChange={on => set('readOnly', on)} label="Read only" hint="It can search but not add or delete documents." />
            </Form>
          )
        : (
            <div className="flex flex-col items-start gap-3 border border-edge p-4" role="status">
              <p className="type-ui">Key <span className="font-code text-meta">{created}</span> created.</p>
              <Button onClick={() => { setCreated(''); reset() }}>Create another</Button>
            </div>
          )}
    </div>
  )
}
