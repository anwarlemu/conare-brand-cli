import { Input } from '@/react/components/ui/Input'
import { Label } from '@/react/components/ui/Label'
// A label over its field, and one with a note: the label names the field, the note says it can be left empty.

export default function Product() {
  return (
    <div className="flex w-90 max-w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5"><Label htmlFor="label-name">Name</Label><Input id="label-name" placeholder="production-agent" /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="label-desc" hint="optional">Description</Label><Input id="label-desc" placeholder="What it is for" /></div>
    </div>
  )
}
