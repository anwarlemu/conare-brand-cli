'use client'
import { Check, Copy } from 'lucide-react'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { useCopy } from '@/react/hooks/useCopy'
// The dark button handing something off, as Copy prompt: hover runs the red squares across, a press darkens them at
// once with no change of size, and once copied the red holds while it says so.

export default function Handoff() {
  const { copied, copy } = useCopy()
  return (
    <>
      <PixelButton done={copied} onClick={() => copy('Connect Conare to this project and run a first search.')}>
        {copied ? <Check size={12} strokeWidth={2} aria-hidden="true" /> : <Copy size={12} strokeWidth={1.5} aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy prompt'}
      </PixelButton>
      <span className="sr-only" aria-live="polite">{copied ? 'prompt copied' : ''}</span>
    </>
  )
}
