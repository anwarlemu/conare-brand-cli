import { cn } from '@/react/lib/cn'

// Steps as squares (SetupMeter.vue, after the overview's pixel meters): 6px squares 2px apart, done steps ink, the next
// one red, the rest an empty hairline. A picture: put the words beside it ("2 of 4 done").
export interface StepMeterProps { steps: boolean[], className?: string }

export function StepMeter({ steps, className }: StepMeterProps) {
  const next = steps.findIndex(f => !f)
  return (
    <span data-ds="step-meter" className={cn('inline-flex gap-0.5', className)} aria-hidden="true">
      {steps.map((done, i) => (
        <i key={i} className={cn('size-1.5 border', done ? 'border-surface-inverse bg-surface-inverse' : i === next ? 'border-edge-accent bg-edge-accent' : 'border-edge-strong')} />
      ))}
    </span>
  )
}

export default StepMeter
