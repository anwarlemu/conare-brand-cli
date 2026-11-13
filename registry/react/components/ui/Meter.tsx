import { cn } from '@/react/lib/cn'

// Progress as a bar (console2.css .v2-meter): a 4px hairline-grey track with an ink fill. `tone="top"` fills it red,
// for the largest share in a list (the bill's amounts); `tone="rest"` in neutral-500, for what the rest add up to.
// `label` names it for screen readers (role meter); `decorative` hides it when the row's text already says it, such
// as a share bar in a table. `live` eases the fill linearly as the value moves (a job's progress), on transform from the
// left, still for reduced motion.
export interface MeterProps { value: number, max?: number, label?: string, tone?: 'default' | 'top' | 'rest', decorative?: boolean, live?: boolean, className?: string }

const FILL = { default: 'bg-surface-inverse', top: 'bg-edge-accent', rest: 'bg-ds-neutral-500' }

export function Meter({ value, max = 100, label, tone = 'default', decorative, live, className }: MeterProps) {
  const share = Math.max(0, Math.min(1, value / (max || 1)))
  return (
    <>
      <style href="ds-meter" precedence="ds">{css}</style>
      <div
        data-ds="meter"
        className={cn('block h-1 bg-edge', className)}
        role={decorative ? undefined : 'meter'}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : label}
        aria-valuemin={decorative ? undefined : 0}
        aria-valuemax={decorative ? undefined : max}
        aria-valuenow={decorative ? undefined : value}
      >
        <span className={cn('block h-full', [FILL[tone], live && 'ds-meter-live'])} style={live ? { transform: `scaleX(${share})` } : { width: `${share * 100}%` }} />
      </div>
    </>
  )
}

export default Meter

const css = `
/* A job's progress moves on its own clock, so it eases linearly (console2.css .v2-meter[data-state]). */
.ds-meter-live { width: 100%; transform-origin: left; transition: transform var(--ds-duration-progress) linear; }
@media (prefers-reduced-motion: reduce) { .ds-meter-live { transition: none; } }
`
