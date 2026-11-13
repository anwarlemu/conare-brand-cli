import { Copy, Download, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Tooltip } from '@/react/components/ui/Tooltip'
// A row's tools as icon buttons, each named by its tooltip. Point at one and wait, then move along: the next shows at
// once. Tab to one and its name shows without a wait.
const tools = [
  { label: 'Copy ID', icon: Copy },
  { label: 'Download', icon: Download },
  { label: 'Sync again', icon: RefreshCw },
  { label: 'Delete', icon: Trash2 },
]

export default function Product() {
  return (
    <div className="flex min-h-24 items-start justify-center gap-1">
      {tools.map(t => (
        <Tooltip key={t.label} text={t.label}>
          <Button variant="ghost" icon aria-label={t.label.toLowerCase()}><t.icon size={14} strokeWidth={1.5} /></Button>
        </Tooltip>
      ))}
    </div>
  )
}
