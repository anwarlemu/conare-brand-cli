import type { ReactNode } from 'react'

// A group's name in the Sidebar (console2.css .v2-nav-label): 12px muted, 16px over it.
export function SidebarLabel({ children }: { children?: ReactNode }) {
  return <p data-ds="sidebar-label" className="px-3 pt-4 pb-1 text-meta text-fg-muted">{children}</p>
}

export default SidebarLabel
