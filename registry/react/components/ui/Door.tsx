import type { ComponentType, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/react/lib/cn'

// A whole card that opens something (console2.css .v2-door): a way in, such as Connect an app or Send by API. Its
// border turns ink under the pointer and while what it opens is open (`expanded`). One link or one button, never a
// clickable div.
export interface DoorProps {
  title: string
  description?: string
  /** A Lucide icon component, drawn at 14px. */
  icon?: ComponentType<{ size?: number, strokeWidth?: number, 'aria-hidden'?: boolean | 'true' }>
  href?: string
  arrow?: boolean
  expanded?: boolean
  className?: string
  onClick?: () => void
  /** Replaces the description (Vue's default slot). */
  children?: ReactNode
}

export function Door({ title, description, icon: Icon, href, arrow, expanded, className, onClick, children }: DoorProps) {
  const classes = cn('flex cursor-pointer flex-col gap-1 border border-edge bg-surface p-3 text-left transition-[border-color,background-color] duration-120 ease-standard hover:border-edge-focus active:bg-surface-subtle aria-expanded:border-edge-focus', className)
  const content = (
    <>
      <span className="flex items-center gap-2 type-ui-strong">
        {Icon && <Icon size={14} strokeWidth={1.5} aria-hidden="true" />}{title}
        {arrow && <ArrowRight size={12} strokeWidth={1.5} className="ml-auto text-fg-muted" aria-hidden="true" />}
      </span>
      {(description || children) && <span className="type-meta text-fg-muted">{children ?? description}</span>}
    </>
  )
  return href
    ? <a data-ds="door" href={href} className={classes} onClick={onClick}>{content}</a>
    : <button data-ds="door" type="button" aria-expanded={expanded} className={classes} onClick={onClick}>{content}</button>
}

export default Door
