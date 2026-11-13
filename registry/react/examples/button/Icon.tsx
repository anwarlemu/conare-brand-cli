import { X } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
// A tool with no label, as the docs panel's close: its name goes to assistive tech.

export default function Icon() {
  return <Button variant="ghost" icon aria-label="close docs"><X size={14} strokeWidth={1.5} /></Button>
}
