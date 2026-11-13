import { Copy, MoreHorizontal, Plus, RotateCw, Trash2 } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
// The console's buttons: one dark main action, secondary for the rest, ghost for tools in a row, danger for what
// removes, the red fix for a failure, and an icon button with its name.

export default function Product() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="dark"><Plus size={14} strokeWidth={1.5} aria-hidden="true" />Create key</Button>
        <Button><Copy size={14} strokeWidth={1.5} aria-hidden="true" />Copy as code</Button>
        <Button>Cancel</Button>
        <Button variant="ghost"><RotateCw size={14} strokeWidth={1.5} aria-hidden="true" />Sync now</Button>
        <Button variant="ghost" icon aria-label="row actions"><MoreHorizontal size={14} strokeWidth={1.5} /></Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="danger"><Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />Revoke</Button>
        <Button variant="brand">Reconnect HubSpot</Button>
      </div>
    </div>
  )
}
