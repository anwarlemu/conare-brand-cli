import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A red box for what broke (console2.css .v2-banner-row): one box per problem, the problem in words (its subject in
// ink, medium) and the button that fixes it. A 6px red square leads it. Stack several in a column 8px apart, one each.
// The `action` slot is the `action` prop.
export interface AlertProps { title: string, action?: ReactNode, className?: string, children?: ReactNode }

export function Alert({ title, action, className, children }: AlertProps) {
  return (
    <div data-ds="alert" className={cn('flex flex-wrap items-center gap-x-3 gap-y-2.5 border border-home-red-press bg-surface-danger py-2.5 pr-3 pl-4 text-fg-danger max-md:items-start max-md:p-3', className)} role="alert">
      <span className="size-1.5 shrink-0 bg-home-red-press max-md:mt-1.75" aria-hidden="true" />
      <p className="min-w-0 flex-1 max-md:basis-[calc(100%-48px)]"><span className="font-medium text-fg">{title}</span> {children}</p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default Alert
