'use client'
import { useEffect, useRef } from 'react'
import { ChevronsUpDown, LogOut, ShieldCheck } from 'lucide-react'
import { Menu } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'

// The person, at the foot of the sidebar (AccountMenu.vue): a black square for the picture, their email, and a menu
// that opens upward with sign-in settings and Sign out in red. Its top shows the credits left on a 4px meter
// (.v2-meter) when `credits` is given; `onOpen` is called each time it opens, so the app can fetch them then.
// `signingOut` keeps the menu open on "Signing out" while the app ends the session. `up: false` opens it downward.
export interface AccountMenuProps {
  email: string
  credits?: { left: string, share: number } | null
  securityHref?: string
  signingOut?: boolean
  up?: boolean
  onOpen?: () => void
  onSignOut?: () => void
}

export function AccountMenu({ email, credits, securityHref = '#', signingOut, up = true, onOpen, onSignOut }: AccountMenuProps) {
  const mark = useRef<HTMLSpanElement | null>(null)
  const report = useRef(onOpen)
  report.current = onOpen
  // Vue's data-ds falls through to Menu's root and its open is watched; React's Menu takes neither yet (data-ds is
  // passed for when it does), so the root is renamed once drawn and its trigger's aria-expanded says when it opens.
  useEffect(() => {
    const root = mark.current?.closest('[data-ds="menu"]')
    root?.setAttribute('data-ds', 'account-menu')
    const trigger = mark.current?.closest('button')
    if (!trigger) return
    const seen = new MutationObserver(() => { if (trigger.getAttribute('aria-expanded') === 'true') report.current?.() })
    seen.observe(trigger, { attributes: true, attributeFilter: ['aria-expanded'] })
    return () => seen.disconnect()
  }, [])
  const share = () => `${Math.max(0, Math.min(1, credits?.share ?? 0)) * 100}%`
  return (
    <Menu
      data-ds="account-menu"
      label="account"
      up={up}
      offset="8px"
      width="calc(100% - 16px)"
      className="!flex h-full w-full"
      triggerClass="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left text-meta before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus"
      trigger={(
        <>
          <span ref={mark} className="size-5 shrink-0 bg-off-black" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-left">{email}</span>
          <ChevronsUpDown size={14} strokeWidth={1.5} className="mr-0.75 shrink-0 text-fg-muted" aria-hidden="true" />
        </>
      )}
    >
      {credits && (
        <>
          <div className="flex flex-col gap-1.5 px-3.5 pt-2 pb-2.5" role="none">
            <p className="flex items-baseline justify-between gap-2"><span className="type-meta text-fg-muted">Credits left</span><span className="font-medium tabular-nums">{credits.left}</span></p>
            <div className="h-1 bg-edge" aria-hidden="true"><span className="block h-full bg-surface-inverse" style={{ width: share() }} /></div>
          </div>
          <MenuSeparator />
        </>
      )}
      <MenuItem href={securityHref}><ShieldCheck size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Sign-in and security</MenuItem>
      <MenuSeparator />
      <MenuItem danger keepOpen disabled={signingOut} onSelect={() => onSignOut?.()}><LogOut size={14} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />{signingOut ? 'Signing out' : 'Sign out'}</MenuItem>
    </Menu>
  )
}

export default AccountMenu
