'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { ConsolePage } from '@/react/components/product/ConsolePage'
import { Button } from '@/react/components/ui/Button'
import { CopyText } from '@/react/components/ui/CopyText'
import { Input } from '@/react/components/ui/Input'
import { LineTabs } from '@/react/components/ui/LineTabs'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Switch } from '@/react/components/ui/Switch'
import { Table } from '@/react/components/ui/Table'
import { Tag } from '@/react/components/ui/Tag'
import { useControllable } from '@/react/hooks/useControllable'

// Settings (pages/dashboard/settings, SettingsFrame take 3): one title and its parts as line tabs under it, switching
// in place. Every part is the settings table, so a tab changes what it says and not how it looks. General: the
// company's name (Edit opens it in place: Save, Cancel or Escape), its ID to copy and when it joined, then who is
// signed in and Sign out. Members: who is in, their role and when they joined, with Invite members, the page's one
// dark button, on the tabs' row. Sign-in: each way in with its switch. It calls nothing: rename, invite, remove,
// toggle and sign-out are callbacks; `part` is the open tab (Vue's v-model:part).
export type SettingsPart = 'general' | 'members' | 'sign-in'
export type SettingsMember = { email: string, role: string, joined: string, invited?: boolean }
export type SignInOption = { id: string, label: string, description: string, on: boolean }
export interface SettingsPageProps {
  company: { name: string, id: string, joined: string }
  members: SettingsMember[]
  signIn: SignInOption[]
  email: string
  part?: SettingsPart
  defaultPart?: SettingsPart
  onPartChange?: (part: SettingsPart) => void
  onRename?: (name: string) => void
  onInvite?: () => void
  onRemove?: (member: SettingsMember) => void
  onToggle?: (id: string, on: boolean) => void
  onSignOut?: () => void
}
const PARTS: { value: SettingsPart, label: string }[] = [{ value: 'general', label: 'General' }, { value: 'members', label: 'Members' }, { value: 'sign-in', label: 'Sign-in' }]

export function SettingsPage({ company, members, signIn, email, part: partValue, defaultPart = 'general', onPartChange, onRename, onInvite, onRemove, onToggle, onSignOut }: SettingsPageProps) {
  const [part, setPart] = useControllable(partValue, defaultPart, onPartChange)
  const uid = useId()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const focusNext = useRef(false)
  useEffect(() => {
    if (editing && focusNext.current) {
      focusNext.current = false
      document.getElementById(`${uid}-rename`)?.focus()
    }
  }, [editing, uid])
  function edit() {
    setDraft(company.name)
    focusNext.current = true
    setEditing(true)
  }
  function save() {
    const name = draft.trim()
    if (!name) return
    setEditing(false)
    onRename?.(name)
  }
  return (
    <ConsolePage data-ds="settings-page" title="Settings">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1"><LineTabs value={part} onValueChange={setPart} options={PARTS} label="settings" /></div>
        {part === 'members' && <PixelButton className="shrink-0" onClick={() => onInvite?.()}>Invite members</PixelButton>}
      </div>

      {part === 'general'
        ? (
            <div className="flex flex-col gap-4">
              <Table variant="settings" framed>
                <thead><tr><th>Company</th><th><span className="sr-only">Value</span></th></tr></thead>
                <tbody>
                  <tr>
                    <td className="whitespace-nowrap text-fg-muted">Name</td>
                    <td className="text-right">
                      {editing
                        ? (
                            <form className="flex flex-wrap items-center justify-end gap-2" onSubmit={(e) => { e.preventDefault(); save() }}>
                              <span className="block w-56 max-w-full"><Input id={`${uid}-rename`} value={draft} onChange={e => setDraft(e.target.value)} maxLength={100} aria-label="new name" required onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false) }} /></span>
                              <PixelButton type="submit" disabled={!draft.trim()}>Save</PixelButton>
                              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                            </form>
                          )
                        : (
                            <span className="inline-flex max-w-full items-center justify-end gap-2">
                              <span className="truncate">{company.name}</span>
                              <Button variant="ghost" icon aria-label="rename company" onClick={edit}><Pencil size={12} strokeWidth={1.5} aria-hidden="true" /></Button>
                            </span>
                          )}
                    </td>
                  </tr>
                  <tr><td className="whitespace-nowrap text-fg-muted">Company ID</td><td className="text-right"><span className="inline-flex max-w-full justify-end"><CopyText value={company.id} label="company id" /></span></td></tr>
                  <tr><td className="whitespace-nowrap text-fg-muted">Joined</td><td className="text-right">{company.joined}</td></tr>
                </tbody>
              </Table>
              <div className="flex items-center justify-between gap-3 type-ui">
                <span className="flex min-w-0 items-center gap-3"><span className="whitespace-nowrap text-fg-muted max-sm:hidden">Signed in as</span><span className="truncate">{email}</span></span>
                <Button variant="danger" className="w-23 shrink-0" onClick={() => onSignOut?.()}>Sign out</Button>
              </div>
            </div>
          )
        : part === 'members'
          ? (
              <Table variant="settings" framed>
                <thead><tr><th>Member</th><th className="w-32 max-sm:hidden">Role</th><th className="w-32 max-md:hidden">Joined</th><th className="w-px"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.email}>
                      <td className="max-w-0">
                        <span className="block truncate" title={m.email}>{m.email}</span>
                        <span className="block type-meta text-fg-muted sm:hidden">{m.role}</span>
                      </td>
                      <td className="max-sm:hidden"><span className="flex items-center gap-1"><Tag tone="quiet">{m.role}</Tag>{m.invited && <Tag tone="quiet">invited</Tag>}</span></td>
                      <td className="whitespace-nowrap text-fg-muted max-md:hidden">{m.joined}</td>
                      <td className="text-right"><Button aria-label={`remove ${m.email}`} onClick={() => onRemove?.(m)}>Remove</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )
          : (
              <Table variant="settings" framed>
                <thead><tr><th className="w-px"><span className="sr-only">On</span></th><th>Sign-in</th></tr></thead>
                <tbody>
                  {signIn.map(o => (
                    <tr key={o.id}>
                      <td><Switch checked={o.on} label={o.label} onCheckedChange={on => onToggle?.(o.id, on)} /></td>
                      <td>
                        <span className="block">{o.label}</span>
                        <span className="block type-meta text-fg-muted">{o.description}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
    </ConsolePage>
  )
}

export default SettingsPage
