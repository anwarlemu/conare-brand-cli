import type { HTMLAttributes } from 'react'
import { Fact } from '@/react/components/ui/Fact'
import { cn } from '@/react/lib/cn'

// Short facts about one thing (console2.css .v2-fact): each a small hairline box with its name, muted, and its value,
// so a row of them wraps cleanly. Pass `facts`, or write Fact as children. `mono` sets a value in Geist Mono (a domain,
// an ID). Six at most; a value that needs a sentence is not a fact.
export type FactItem = { name: string, value: string, mono?: boolean }

export interface FactsProps extends HTMLAttributes<HTMLDListElement> {
  facts?: FactItem[]
}

export function Facts({ facts, className, children, ...rest }: FactsProps) {
  return (
    <dl data-ds="facts" className={cn('flex flex-wrap gap-2', className)} {...rest}>
      {children ?? facts?.map(f => <Fact key={f.name} name={f.name} value={f.value} mono={f.mono} />)}
    </dl>
  )
}

export default Facts
