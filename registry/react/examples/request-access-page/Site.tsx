'use client'
import { useState } from 'react'
import { RequestAccessPage, type AccessAnswers, type AccessState } from '@/react/components/site/RequestAccessPage'
// The request-access page as it ships, with a sample requester: send the form to see the sent state, and change the
// answers to come back. The app would post the answers; here they wait a moment instead.

export default function Site() {
  const [state, setState] = useState<AccessState>('form')
  const [sending, setSending] = useState(false)
  function submit(_answers: AccessAnswers) {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setState('sent')
    }, 600)
  }
  return (
    <RequestAccessPage
      state={state}
      email="sam@acme.com"
      name="Sam"
      sending={sending}
      homeHref="#home"
      demoHref="#demo"
      signInHref="#sign-in"
      privacyHref="#privacy"
      full={false}
      onSubmit={submit}
      onEdit={() => setState('form')}
    />
  )
}
