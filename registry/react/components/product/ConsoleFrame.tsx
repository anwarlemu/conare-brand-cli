'use client'
import { useEffect, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react'
import { Menu as MenuIcon, X } from 'lucide-react'
import { Breadcrumb, type Crumb } from '@/react/components/ui/Breadcrumb'
import { Sidebar } from '@/react/components/ui/Sidebar'
import { SidebarLabel } from '@/react/components/ui/SidebarLabel'
import { SidebarLink } from '@/react/components/ui/SidebarLink'
import { TopBar } from '@/react/components/ui/TopBar'

// The console's layout (layouts/console.vue) for page compositions: the Sidebar at the left, sticky at the screen's
// height, the TopBar with the trail over the page. Below 768px the sidebar is a drawer: the bar's menu button slides
// it in over a dimmed page (240ms in, 180ms out, on the strong ease-out), a tap on the page or Escape closes it.
// `head` takes the workspace switcher, `foot` the account menu, `bar` what sits at the bar's end.
export interface FrameLink { label: string, icon?: ComponentType<{ size?: number, strokeWidth?: number }>, href?: string, status?: string, alert?: boolean, active?: boolean }
export interface FrameGroup { label: string, links: FrameLink[] }
export interface ConsoleFrameProps {
  groups: FrameGroup[]
  crumbs: Crumb[]
  onNavigate?: (link: FrameLink) => void
  /** The workspace switcher (Vue's `head` slot). */
  head?: ReactNode
  /** The account menu (Vue's `foot` slot). */
  foot?: ReactNode
  /** What sits at the bar's end (Vue's `bar` slot). */
  bar?: ReactNode
  children?: ReactNode
}

export function ConsoleFrame({ groups, crumbs, onNavigate, head, foot, bar, children }: ConsoleFrameProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement | null>(null)
  // Vue's data-open falls through to the Sidebar's root; Sidebar takes no extra attributes, so it is set here.
  useEffect(() => {
    root.current?.querySelector('[data-ds="sidebar"]')?.toggleAttribute('data-open', open)
  }, [open])
  function go(link: FrameLink, event: MouseEvent) {
    event.preventDefault()
    setOpen(false)
    onNavigate?.(link)
  }
  return (
    <>
      <style href="ds-console-frame" precedence="ds">{css}</style>
      <div data-ds="console-frame" ref={root} className="flex min-h-screen bg-surface" onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}>
        <Sidebar label="console" className="ds-frame-side shrink-0" head={head} foot={foot}>
          {groups.map(group => [
            <SidebarLabel key={`l-${group.label}`}>{group.label}</SidebarLabel>,
            ...group.links.map(link => <SidebarLink key={`${group.label}-${link.label}`} href={link.href ?? '#'} icon={link.icon} status={link.status} alert={link.alert} active={link.active} onClick={e => go(link, e)}>{link.label}</SidebarLink>),
          ])}
        </Sidebar>
        {open && <div className="fixed inset-0 z-20 bg-scrim-light md:hidden" aria-hidden="true" onClick={() => setOpen(false)} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            start={(
              <button type="button" className="-ml-2 inline-flex size-control-touch shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge hover:text-fg md:hidden" aria-expanded={open} aria-label={open ? 'close menu' : 'open menu'} onClick={() => setOpen(o => !o)}>
                {open ? <X size={14} strokeWidth={1.5} /> : <MenuIcon size={14} strokeWidth={1.5} />}
              </button>
            )}
            end={bar}
          >
            <Breadcrumb items={crumbs} onNavigate={(_, e) => e.preventDefault()} />
          </TopBar>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </>
  )
}

export default ConsoleFrame

const css = `
@media (min-width: 768px) { .ds-frame-side { position: sticky; top: 0; height: 100vh; } }
@media (max-width: 767px) {
  .ds-frame-side { position: fixed; top: 0; bottom: 0; left: 0; z-index: 30; width: min(300px, 84vw); overscroll-behavior: contain; visibility: hidden; transform: translateX(-100%); transition: transform var(--ds-duration-slide) var(--ds-easing-out), visibility 0s linear var(--ds-duration-slide); }
  .ds-frame-side[data-open] { visibility: visible; transform: none; transition: transform var(--ds-duration-drawer) var(--ds-easing-out); }
}
@media (prefers-reduced-motion: reduce) { .ds-frame-side, .ds-frame-side[data-open] { transition: none; } }
`
