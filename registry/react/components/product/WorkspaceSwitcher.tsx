'use client'
import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import { Check, ChevronsUpDown, Plus, Settings, Users } from 'lucide-react'
import { Menu } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
import { useControllable } from '@/react/hooks/useControllable'

// The organization switcher at the top of the sidebar (WorkspaceMenu.vue): the brand mark (`mark`, an initial tile
// without it), the organization in 12px medium over its customer and role in 11px muted, and a 264px menu of every
// organization the person reaches, grouped by customer under a label with the role tag, the current one checked and in
// medium. Then what goes with an organization: New organization (admins), its settings, its members. Vue's v-model is
// `value` with `onValueChange` (or `defaultValue` alone): the current organization's id; `switching` marks the one
// opening while the others wait.
export interface WorkspaceGroup { id: string, name: string, role?: string, organizations: Array<{ id: string, name: string, default?: boolean }> }
export interface WorkspaceSwitcherProps {
  groups: WorkspaceGroup[]
  admin?: boolean
  switching?: string
  error?: string
  settingsHref?: string
  membersHref?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onCreate?: () => void
  mark?: ReactNode
}

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '·'

export function WorkspaceSwitcher({ groups, admin, switching, error, settingsHref = '#', membersHref = '#', value, defaultValue = '', onValueChange, onCreate, mark }: WorkspaceSwitcherProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const name = useRef<HTMLSpanElement | null>(null)
  // Vue's data-ds falls through to Menu's root; React's Menu takes none yet (it is passed for when it does), so the
  // root is renamed once drawn.
  useEffect(() => { name.current?.closest('[data-ds="menu"]')?.setAttribute('data-ds', 'workspace-switcher') }, [])
  let where: { org: WorkspaceGroup['organizations'][number], group: WorkspaceGroup } | undefined
  for (const g of groups) {
    const o = g.organizations.find(x => x.id === current)
    if (o && !where) where = { org: o, group: g }
  }
  const several = groups.length > 1
  function choose(id: string) {
    if (id !== current && !switching) setCurrent(id)
  }
  return (
    <Menu
      data-ds="workspace-switcher"
      label="workspaces"
      offset="8px"
      className="!flex h-full w-full"
      triggerClass="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus"
      trigger={(
        <>
          {mark ?? <span className="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{initial(where?.org.name ?? '')}</span>}
          <span ref={name} className="min-w-0 flex-1">
            <span className="block translate-y-[0.5px] truncate text-meta leading-3 font-medium">{where?.org.name ?? ' '}</span>
            <span className="mt-px block translate-y-[0.5px] truncate pb-0.75 -mb-0.75 text-caption leading-2.5 text-fg-muted">{where?.group.name ?? ' '}{where?.group.role && ` · ${where.group.role}`}</span>
          </span>
          <ChevronsUpDown size={14} strokeWidth={1.5} className="mr-0.75 shrink-0 text-fg-muted" aria-hidden="true" />
        </>
      )}
    >
      {groups.map(g => (
        <Fragment key={g.id}>
          <MenuLabel>
            <span className="truncate">{g.name}</span>
            {(several || g.role) && g.role && <span className="shrink-0 border border-edge px-1 text-caption leading-4">{g.role}</span>}
          </MenuLabel>
          {g.organizations.map(o => (
            <MenuItem key={o.id} current={o.id === current} disabled={!!switching && switching !== o.id} onSelect={() => choose(o.id)}>
              <span className="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{initial(o.name)}</span>
              <span className="min-w-0 flex-1 truncate">{o.name}</span>
              {switching === o.id
                ? <span className="type-meta text-fg-muted">opening</span>
                : o.default && <span className="type-meta text-fg-muted">default</span>}
              {o.id === current && <Check size={14} strokeWidth={1.5} className="shrink-0" aria-label="current" />}
            </MenuItem>
          ))}
        </Fragment>
      ))}
      <MenuSeparator />
      {admin && <MenuItem onSelect={() => onCreate?.()}><Plus size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />New organization</MenuItem>}
      <MenuItem href={settingsHref}><Settings size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Organization settings</MenuItem>
      <MenuItem href={membersHref}><Users size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />{admin ? 'Invite members' : 'Members'}</MenuItem>
      {error && <p className="px-3 py-1 type-meta text-fg-danger" role="alert">{error}</p>}
    </Menu>
  )
}

export default WorkspaceSwitcher
