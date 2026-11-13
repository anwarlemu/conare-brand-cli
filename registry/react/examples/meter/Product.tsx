import { Meter } from '@/react/components/ui/Meter'
import { StepMeter } from '@/react/components/ui/StepMeter'
// Credits left as a bar, and setup with two of four steps done.

export default function Product() {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">How much is left</p>
      <div className="flex max-w-80 flex-col gap-2">
        <p className="flex justify-between type-meta"><span className="text-fg-muted">Credits left</span><span>$268.73</span></p>
        <Meter value={268.73} max={310} label="credits left" />
      </div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Steps done</p>
      <div className="flex min-h-7 items-center gap-3">
        <StepMeter steps={[true, true, false, false]} />
        <span className="type-meta text-fg-muted">2 of 4 done</span>
      </div>
    </div>
  )
}
