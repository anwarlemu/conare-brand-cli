import type { LabelHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// Field's label on its own (console2.css forms): 12px in the soft grey, over or beside the control it names, never in
// place of one. `htmlFor` ties it to the control's id (Vue's `for`); `hint` adds a muted note after it, such as
// "optional".
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  hint?: string
  children?: ReactNode
}

export function Label({ hint, className, children, ...rest }: LabelProps) {
  return <label data-ds="label" {...rest} className={cn('inline-flex items-baseline gap-1.5 type-meta text-fg-soft', className)}>{children}{hint && <span className="text-fg-muted">{hint}</span>}</label>
}

export default Label
