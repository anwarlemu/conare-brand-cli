import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The 48px bar over every console page (console2.css .v2-bar): sticky, a hairline under it, the page showing faintly
// through it (92% of the surface under an 8px blur), 12px text. Put a Breadcrumb in children; `start` holds the
// phone's menu button, `end` what belongs to the whole console (setup progress, a loading mark), never the page's
// own actions.
export interface TopBarProps { start?: ReactNode, end?: ReactNode, className?: string, children?: ReactNode }

export function TopBar({ start, end, className, children }: TopBarProps) {
  return (
    <header data-ds="top-bar" className={cn('sticky top-0 z-10 flex h-bar shrink-0 items-center gap-2 border-b border-edge bg-bar px-4 text-meta leading-5 backdrop-blur-sm', className)}>
      {start}
      {children}
      {end}
    </header>
  )
}

export default TopBar
