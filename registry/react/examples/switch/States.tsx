import { Switch } from '@/react/components/ui/Switch'
// A setting to press, on or off, and one that can't be changed.

export default function States() {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">A setting</p>
      <div className="flex min-h-7 items-center"><Switch defaultChecked label="email sign-in" /></div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Can't be changed</p>
      <div className="flex min-h-7 items-center"><Switch checked label="on, can't be changed" disabled /></div>
    </div>
  )
}
