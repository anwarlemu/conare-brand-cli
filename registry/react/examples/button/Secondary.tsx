import { Copy } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
// Every other action, the default: a hairline that turns ink under the pointer, the paper while pressed.

export default function Secondary() {
  return <Button press><Copy size={12} strokeWidth={1.5} aria-hidden="true" />Copy as code</Button>
}
