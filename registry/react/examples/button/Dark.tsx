import { KeyRound } from 'lucide-react'
import { PixelButton } from '@/react/components/ui/PixelButton'
// The one main action on a view, as API keys has it: the website's dark button, its red squares running in on hover.

export default function Dark() {
  return <PixelButton large>Create key<KeyRound size={14} strokeWidth={1.5} aria-hidden="true" /></PixelButton>
}
