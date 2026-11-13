'use client'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { useCopy } from '@/react/hooks/useCopy'
// The states a button goes through: at rest, waiting (disabled is grey with a dark label, never faded), and done (the
// check and "Copied" for 1.5s).

export default function States() {
  const { copied, copy } = useCopy()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>At rest</Button>
      <Button variant="dark" disabled>Create key</Button>
      <Button disabled>Disabled</Button>
      <Button onClick={() => copy('ns_contracts')}>
        {copied ? <Check size={12} strokeWidth={2} aria-hidden="true" /> : <Copy size={12} strokeWidth={1.5} aria-hidden="true" />}{copied ? 'Copied' : 'Copy ID'}
      </Button>
    </div>
  )
}
