import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The console's navigation (console2.css .v2-side): 216px of paper with a hairline at its edge. Put a SidebarLabel
// over each group and a SidebarLink per page; `head` holds the workspace switcher (48px, over a hairline) and `foot`
// the account menu. It stays open on wide screens; on a phone the app shows it as a drawer over the page.
export interface SidebarProps { label?: string, head?: ReactNode, foot?: ReactNode, className?: string, children?: ReactNode }

export function Sidebar({ label, head, foot, className, children }: SidebarProps) {
  return (
    <nav data-ds="sidebar" className={cn('flex w-sidebar flex-col border-r border-edge bg-surface-subtle', className)} aria-label={label ?? 'main'}>
      {head && <div className="h-bar shrink-0 border-b border-edge">{head}</div>}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">{children}</div>
      {foot && <div className="shrink-0 border-t border-edge">{foot}</div>}
    </nav>
  )
}

export default Sidebar
