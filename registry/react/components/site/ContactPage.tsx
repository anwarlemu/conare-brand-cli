'use client'
import { useState } from 'react'
import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteFrameProps } from '@/react/components/site/SitePage'
import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Textarea } from '@/react/components/ui/Textarea'

// Contact: the head, then the ways to reach the team on the left (each a label over its address, between hairlines)
// and the form on the right in the double rule (name, work email, company, message; the browser asks for the empty
// ones), its one dark button at the foot. It calls nothing: `onSubmit` carries the answers, and `sent` (the app's)
// swaps the form for what happens next; `onEdit` asks for the form back. A failure from the server shows above the button.
export type ContactAnswers = { name: string, email: string, company: string, message: string }
export interface ContactPageProps extends SiteFrameProps {
  head: { tag?: string, title: string, body?: string }
  channels: { label: string, value: string, href: string }[]
  sent?: boolean
  sending?: boolean
  error?: string
  onSubmit?: (answers: ContactAnswers) => void
  onEdit?: () => void
}

const link = 'underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-standard hover:decoration-fg'

export function ContactPage({ header, footer, announcement, logo, actions, head, channels, sent, sending, error, onSubmit, onEdit }: ContactPageProps) {
  const [answers, setAnswers] = useState<ContactAnswers>({ name: '', email: '', company: '', message: '' })
  const set = (key: keyof ContactAnswers) => (event: { target: { value: string } }) => setAnswers(a => ({ ...a, [key]: event.target.value }))
  return (
    <SitePage data-ds="contact-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
      <section aria-labelledby="contact-page-title" className="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
        <SectionHead as="h1" titleId="contact-page-title" tag={head.tag} title={head.title} body={head.body} />
        <div className="mx-auto mt-14 grid max-w-[1008px] grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
          <dl className="flex flex-col self-start border-t border-edge">
            {channels.map(c => (
              <div key={c.label} className="flex flex-col gap-1 border-b border-edge py-5">
                <dt className="type-meta text-fg-muted">{c.label}</dt>
                <dd className="type-body-lg text-fg"><a href={c.href} className={link}>{c.value}</a></dd>
              </div>
            ))}
          </dl>
          <div className="border border-edge p-5 outline outline-offset-4 outline-edge sm:p-6">
            {sent
              ? (
                  <div role="status" className="type-ui">
                    <h2 className="type-heading-4">We have your message.</h2>
                    <p className="mt-2 text-fg-muted">We reply by email, usually within a working day.</p>
                    <Button className="mt-6" onClick={() => onEdit?.()}>Send another</Button>
                  </div>
                )
              : (
                  <form className="flex flex-col gap-5" aria-label="Contact" onSubmit={(e) => { e.preventDefault(); onSubmit?.({ ...answers }) }}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Name">
                        {({ id }) => <Input id={id} value={answers.name} onChange={set('name')} autoComplete="name" maxLength={200} required />}
                      </Field>
                      <Field label="Work email">
                        {({ id }) => <Input id={id} value={answers.email} onChange={set('email')} type="email" autoComplete="email" maxLength={200} required />}
                      </Field>
                    </div>
                    <Field label="Company">
                      {({ id }) => <Input id={id} value={answers.company} onChange={set('company')} autoComplete="organization" maxLength={200} />}
                    </Field>
                    <Field label="Message">
                      {({ id }) => <Textarea id={id} value={answers.message} onChange={set('message')} rows={5} maxLength={4000} placeholder="What you want to build, and what you need from us." required />}
                    </Field>
                    {error && <p className="bg-surface-danger px-3 py-2 type-ui" role="alert">{error}</p>}
                    <div><PixelButton type="submit" disabled={sending}>{sending ? 'Sending' : 'Send message'}</PixelButton></div>
                  </form>
                )}
          </div>
        </div>
      </section>
    </SitePage>
  )
}

export default ContactPage
