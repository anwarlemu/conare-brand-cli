'use client'
import { useState } from 'react'
import { SectionHead } from '@/react/components/site/SectionHead'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { PixelButton } from '@/react/components/ui/PixelButton'

// A sign-up for news by email: the band's head, then one email field and the one dark button in the website's double
// rule. It calls nothing: `onSubmit` carries the address, `sent` (the app's) swaps the form for the line the app gives,
// and a failure from the server shows under it. The site has no newsletter: set from the contact form's field, button
// and frame.
export interface NewsletterProps {
  title: string, tag?: string, body?: string, label?: string, action?: string
  sent?: boolean, sentText?: string, sending?: boolean, error?: string, titleId?: string
  onSubmit?: (email: string) => void
}

export function Newsletter({ title, tag, body, label = 'Work email', action = 'Subscribe', sent, sentText = '', sending, error, titleId = 'newsletter-title', onSubmit }: NewsletterProps) {
  const [email, setEmail] = useState('')
  return (
    <section data-ds="newsletter" aria-labelledby={titleId} className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
      <SectionHead title={title} tag={tag} body={body} titleId={titleId} />
      <div className="mx-auto mt-10 max-w-[560px] border border-edge p-5 outline outline-offset-4 outline-edge sm:p-6">
        {sent
          ? <p role="status" className="type-ui text-fg">{sentText}</p>
          : (
              <form className="flex flex-col gap-4 sm:flex-row sm:items-end" aria-label={title} onSubmit={(e) => { e.preventDefault(); onSubmit?.(email) }}>
                <div className="min-w-0 flex-1">
                  <Field label={label}>
                    {({ id }) => <Input id={id} value={email} onChange={(e: { target: { value: string } }) => setEmail(e.target.value)} type="email" autoComplete="email" maxLength={200} required />}
                  </Field>
                </div>
                <div><PixelButton type="submit" disabled={sending}>{action}</PixelButton></div>
              </form>
            )}
        {error && <p className="mt-4 bg-surface-danger px-3 py-2 type-ui" role="alert">{error}</p>}
      </div>
    </section>
  )
}

export default Newsletter
