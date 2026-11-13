'use client'
import { useState } from 'react'
import { Check, Copy, Download, FilePlus, Layers, RefreshCw, Trash2, Upload } from 'lucide-react'
import { Menubar } from '@/react/components/ui/Menubar'
import { MenubarMenu } from '@/react/components/ui/MenubarMenu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
// A namespace's tools as a menubar: what to add, what to do with it, how to show its documents. Open one, then point
// at the next or press Right.
const sorts = [{ id: 'newest', label: 'Newest first' }, { id: 'title', label: 'Title' }, { id: 'size', label: 'Size' }] as const

export default function Product() {
  const [sort, setSort] = useState<'newest' | 'title' | 'size'>('newest')
  return (
    <div className="min-h-72">
      <Menubar label="namespace">
        <MenubarMenu label="Add">
          <MenuItem><FilePlus size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Paste text</MenuItem>
          <MenuItem><Upload size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Upload files</MenuItem>
          <MenuItem><Layers size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Connect an app</MenuItem>
        </MenubarMenu>
        <MenubarMenu label="Namespace">
          <MenuItem><RefreshCw size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Sync now</MenuItem>
          <MenuItem><Copy size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Copy name</MenuItem>
          <MenuItem><Download size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Export documents</MenuItem>
          <MenuSeparator />
          <MenuItem danger><Trash2 size={14} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />Delete namespace</MenuItem>
        </MenubarMenu>
        <MenubarMenu label="View">
          <MenuLabel>Sort documents</MenuLabel>
          {sorts.map(s => (
            <MenuItem key={s.id} current={sort === s.id} onSelect={() => setSort(s.id)}>
              <span className="min-w-0 flex-1">{s.label}</span>
              {sort === s.id && <Check size={14} strokeWidth={1.5} className="shrink-0" aria-label="current" />}
            </MenuItem>
          ))}
        </MenubarMenu>
      </Menubar>
    </div>
  )
}
