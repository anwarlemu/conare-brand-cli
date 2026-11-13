import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// One fact: a 24px hairline box, 12px, the name muted and the value in ink. Inside Facts (a <dl>).
export interface FactProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  value?: string
  mono?: boolean
}

export function Fact({ name, value, mono, className, children, ...rest }: FactProps) {
  return (
    <div data-ds="fact" className={cn('flex min-w-0 items-center gap-1.5 border border-edge bg-surface px-2 py-1 type-meta', className)} {...rest}>
      <dt className="text-fg-muted">{name}</dt>
      <dd className={cn('min-w-0', mono && 'font-code')}>{children ?? value}</dd>
    </div>
  )
}

export default Fact
