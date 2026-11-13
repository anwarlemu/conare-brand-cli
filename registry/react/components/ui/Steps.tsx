import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// Steps that open one at a time (console2.css .v2-movesteps): Step rows, each over a hairline.
export type StepsProps = HTMLAttributes<HTMLOListElement>

export function Steps({ className, children, ...rest }: StepsProps) {
  return <ol data-ds="steps" className={cn('m-0 mt-2 flex w-full list-none flex-col p-0', className)} {...rest}>{children}</ol>
}

export default Steps
