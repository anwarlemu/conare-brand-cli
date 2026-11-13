'use client'
import { useState } from 'react'
import { InputOtp } from '@/react/components/ui/InputOtp'
// The code from the sign-in email: six digits in two threes. Type, paste or take the phone's suggestion; 000000 shows
// the wrong-code state.

export default function Product() {
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'wrong' | 'ok'>('idle')
  function check(value: string) {
    setState('checking')
    setTimeout(() => setState(value === '000000' ? 'wrong' : 'ok'), 600)
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <p id="otp-label" className="type-meta text-fg-soft">Code from the email</p>
      <InputOtp value={code} onValueChange={(v) => { setCode(v); setState('idle') }} label="code from the email" split={3} invalid={state === 'wrong'} onComplete={check} />
      <p className={state === 'wrong' ? 'min-h-4 type-meta text-fg-danger' : 'min-h-4 type-meta text-fg-muted'} role="status">
        {state === 'checking' ? 'Checking' : state === 'wrong' ? 'That code is not right. Check the latest email.' : state === 'ok' ? 'Signed in.' : 'It expires in 10 minutes.'}
      </p>
    </div>
  )
}
