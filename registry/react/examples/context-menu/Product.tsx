'use client'
import { useState } from 'react'
import { Copy, Download, ExternalLink, FileText, Trash2 } from 'lucide-react'
import { ContextMenu } from '@/react/components/ui/ContextMenu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
import { Toaster } from '@/react/components/ui/Toaster'
import { useToast } from '@/react/hooks/useToast'
// A namespace's documents: right-click a row, or focus it and press Shift+F10, for what you can do with it.
const documents = [
  { id: 'doc_8f2k1', title: 'Master services agreement', size: '412 KB' },
  { id: 'doc_3m9q7', title: 'Order form, 2026 renewal', size: '96 KB' },
  { id: 'doc_5t0x2', title: 'Data processing addendum', size: '184 KB' },
]

export default function Product() {
  const [picked, setPicked] = useState<string>()
  const toast = useToast()
  const doc = () => documents.find(d => d.id === picked)
  return (
    <div className="min-h-80 max-w-120">
      <ContextMenu
        label="document"
        onOpen={setPicked}
        menu={(
          <>
            <MenuLabel><span className="truncate">{doc()?.title}</span></MenuLabel>
            <MenuItem onSelect={() => toast('Opened', doc()?.id)}><ExternalLink size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Open</MenuItem>
            <MenuItem onSelect={() => toast('Copied', doc()?.id)}><Copy size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Copy ID</MenuItem>
            <MenuItem onSelect={() => toast('Downloading', doc()?.title)}><Download size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Download</MenuItem>
            <MenuSeparator />
            <MenuItem danger onSelect={() => toast('Deleted', doc()?.id)}><Trash2 size={14} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />Delete</MenuItem>
          </>
        )}
      >
        <ul className="border border-edge">
          {documents.map(d => (
            <li key={d.id} data-context={d.id} tabIndex={0} className="flex h-row items-center gap-2 border-b border-edge px-3 last:border-b-0 transition-colors duration-120 ease-standard hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus">
              <FileText size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{d.title}</span>
              <span className="type-code-sm text-fg-muted max-md:hidden">{d.id}</span>
              <span className="w-14 text-right type-meta text-fg-muted tabular-nums">{d.size}</span>
            </li>
          ))}
        </ul>
      </ContextMenu>
      <p className="mt-3 type-meta text-fg-muted">Right-click a document, or focus it and press Shift+F10.</p>
      <Toaster />
    </div>
  )
}
