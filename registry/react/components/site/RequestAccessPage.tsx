'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { NativeSelect } from '@/react/components/ui/NativeSelect'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Textarea } from '@/react/components/ui/Textarea'
import { cn } from '@/react/lib/cn'

// Where sign-in sends someone it does not admit (pages/request-access.vue): the mark, the title and one line, then the
// part for where they are. `state` is the app's: loading (shown after 300ms), signed-out (sign in with a work email
// first), failed (try again), form (their email, then name, company, team size and what they want to build) or sent
// (what happens next). It calls nothing: `onSubmit` carries the answers, `onRetry` and `onEdit` ask the app to load
// again or reopen the form. `full` fills the window; off, it sits in its container.
export type AccessState = 'loading' | 'signed-out' | 'failed' | 'form' | 'sent'
export type AccessAnswers = { name: string, company: string, teamSize: string, useCase: string }

export interface RequestAccessPageProps {
  state: AccessState
  email?: string
  personalEmail?: boolean
  name?: string
  teamSizes?: readonly string[]
  sending?: boolean
  error?: string
  title?: string
  homeHref: string
  demoHref: string
  signInHref: string
  privacyHref: string
  supportEmail?: string
  full?: boolean
  onSubmit?: (answers: AccessAnswers) => void
  onRetry?: () => void
  onEdit?: () => void
}

const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-1,000', '1,001+']
const link = 'underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-standard hover:decoration-fg'
const MARK = 'M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z'

export function RequestAccessPage({ state, email, personalEmail, name, teamSizes = TEAM_SIZES, sending, error, title = 'Conare is invite-only', homeHref, demoHref, signInHref, privacyHref, supportEmail = 'support@acme.com', full = true, onSubmit, onRetry, onEdit }: RequestAccessPageProps) {
  const [answers, setAnswers] = useState<AccessAnswers>({ name: name ?? '', company: '', teamSize: '', useCase: '' })
  useEffect(() => {
    if (name) setAnswers(a => (a.name ? a : { ...a, name }))
  }, [name])
  const set = (key: keyof AccessAnswers) => (value: string) => setAnswers(a => ({ ...a, [key]: value }))

  return (
    <>
      <style href="ds-request-access-page" precedence="ds">{css}</style>
      <main data-ds="request-access-page" className={cn('bg-surface px-4 py-12 text-fg md:py-24', full && 'min-h-dvh')}>
        <div className="mx-auto max-w-140">
          <a href={homeHref} aria-label="Home" className="inline-block">
            <svg viewBox="0 0 149 134" className="h-8 w-auto" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d={MARK} /></svg>
          </a>
          <h1 className="mt-12 type-heading-3">{title}</h1>
          <p className="mt-4 type-ui text-fg-muted">We set it up with each company directly. Tell us about your team and we'll reply by email, or <a href={demoHref} className={cn(link, 'text-fg')}>book a demo</a>.</p>

          {state === 'loading' && <p className="ds-access-loading mt-8 type-ui text-fg-muted" role="status">Loading.</p>}

          {state === 'signed-out' && (
            <section className="mt-8 border border-edge p-4 type-ui" data-state="signed-out">
              <p>Sign in with your work email first. We reply to that address, and it's the one your organization will use.</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <PixelButton href={signInHref}>Sign in</PixelButton>
                <a href={`mailto:${supportEmail}`} className={cn('type-meta', link)}>or write to {supportEmail}</a>
              </div>
            </section>
          )}

          {state === 'failed' && (
            <section className="mt-8" data-state="failed">
              <p className="bg-surface-danger px-3 py-2 type-ui" role="alert">Something went wrong. Try again.</p>
              <Button className="mt-4" onClick={() => onRetry?.()}>Try again</Button>
            </section>
          )}

          {state === 'form' && (
            <form className="mt-8 flex flex-col gap-6 border border-edge p-4" data-state="form" onSubmit={(e) => { e.preventDefault(); onSubmit?.({ ...answers }) }}>
              <div>
                <p className="type-meta text-fg-soft">Work email</p>
                <p className="mt-1.5 type-ui wrap-anywhere">{email}</p>
                {personalEmail
                  ? <p className="mt-2 type-meta text-fg-muted">This is a personal address. To ask for your company, <a href={signInHref} className={cn('text-fg', link)}>sign in with your work email</a>.</p>
                  : <a href={signInHref} className={cn('mt-2 inline-block type-meta', link)}>Use a different email</a>}
              </div>
              <Field label="Name">
                {({ id }) => <Input id={id} value={answers.name} onChange={e => set('name')(e.target.value)} autoComplete="name" maxLength={200} required />}
              </Field>
              <Field label="Company">
                {({ id }) => <Input id={id} value={answers.company} onChange={e => set('company')(e.target.value)} autoComplete="organization" maxLength={200} required />}
              </Field>
              <Field label="Team size">
                {({ id }) => (
                  <NativeSelect id={id} value={answers.teamSize} onChange={e => set('teamSize')(e.target.value)} required>
                    <option value="" disabled>Choose</option>
                    {teamSizes.map(size => <option key={size} value={size}>{size} people</option>)}
                  </NativeSelect>
                )}
              </Field>
              <Field label="What you want to build">
                {({ id }) => <Textarea id={id} value={answers.useCase} onChange={e => set('useCase')(e.target.value)} maxLength={4000} placeholder="For example: support agents that answer from our help center and past tickets." required />}
              </Field>
              {error && <p className="bg-surface-danger px-3 py-2 type-ui" role="alert">{error}</p>}
              <div className="flex flex-wrap items-center gap-4">
                <PixelButton type="submit" disabled={sending}>{sending ? 'Sending' : 'Send request'}</PixelButton>
                <p className="type-meta text-fg-muted">We use these answers only to reply to you. <a href={privacyHref} className={cn('text-fg', link)}>Privacy policy</a>.</p>
              </div>
            </form>
          )}

          {state === 'sent' && (
            <section className="mt-8 border border-edge p-4 type-ui" data-state="sent" role="status">
              <h2 className="type-heading-4">We have your request.</h2>
              <p className="mt-2">We'll reply to <span className="wrap-anywhere">{email}</span>.</p>
              <p className="mt-8 type-meta text-fg-muted">What happens next</p>
              <ol className="mt-4 flex flex-col gap-3">
                <li className="flex gap-4"><span className="text-fg-muted tabular-nums">1</span><span>We read your request and reply by email.</span></li>
                <li className="flex gap-4"><span className="text-fg-muted tabular-nums">2</span><span>If it fits, we create an organization for your company and invite you to it.</span></li>
                <li className="flex gap-4"><span className="text-fg-muted tabular-nums">3</span><span>Open the invite and sign in with this email. The dashboard opens on get started.</span></li>
              </ol>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href={homeHref}>Back to the website</Button>
                <button type="button" className={cn('cursor-pointer type-meta', link)} onClick={() => onEdit?.()}>Change your answers</button>
              </div>
            </section>
          )}

          {(state === 'form' || state === 'signed-out') && <p className="mt-6 type-meta text-fg-muted">Is your team already on it? Ask one of its admins to invite you.</p>}
        </div>
      </main>
    </>
  )
}

export default RequestAccessPage

const css = `
/* "Loading." shows only when a load is slow, after 300ms. */
.ds-access-loading { animation: ds-access-appear var(--ds-duration-enter) var(--ds-easing-standard) 300ms both; }
@keyframes ds-access-appear { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-access-loading { animation-duration: 0ms; } }
`
