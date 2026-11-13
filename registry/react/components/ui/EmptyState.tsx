import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// A dashed box for a list with nothing in it yet (console2.css .v2-empty): one line on what is missing and the
// actions that fill it, 8px under it. No illustrations, and never without a way forward.
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  description?: string
}

export function EmptyState({ title, description, className, children, ...rest }: EmptyStateProps) {
  return (
    <div data-ds="empty-state" className={cn('flex flex-col items-center gap-1 border border-dashed border-edge-strong px-4 py-10 text-center', className)} {...rest}>
      <p className="type-ui">{title}</p>
      {description && <p className="type-meta text-fg-muted">{description}</p>}
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}

export default EmptyState
