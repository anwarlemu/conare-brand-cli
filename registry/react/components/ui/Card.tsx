import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A bordered box for one subject (console2.css .v2-card): a head with its title and actions over a hairline, then the
// body. Square, no shadow. `framed` adds the website's double rule, a second hairline 4px outside, for the one block a
// page leads with. `flush` drops the body's padding, for a table that runs to the edges.
export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string
  framed?: boolean
  flush?: boolean
  /** The head's actions (Vue's `actions` slot): links or buttons at its end. */
  actions?: ReactNode
}

export function Card({ title, framed, flush, actions, className, children, ...rest }: CardProps) {
  const titleId = `card-${useId()}`
  return (
    <section data-ds="card" className={cn('border border-edge bg-surface', framed && 'outline outline-offset-4 outline-edge', className)} aria-labelledby={title ? titleId : undefined} {...rest}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-edge px-4 py-3">
          {title && <h3 id={titleId} className="type-ui-strong">{title}</h3>}
          {actions && <div className="flex items-center gap-2 type-meta text-fg-muted">{actions}</div>}
        </div>
      )}
      <div className={flush ? undefined : 'p-4'}>{children}</div>
    </section>
  )
}

export default Card
