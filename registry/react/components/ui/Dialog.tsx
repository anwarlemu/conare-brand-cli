'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useControllable } from '@/react/hooks/useControllable'

// A native dialog (the console's Modal.vue): the title, a close button, the form. Focus stays inside; Escape and the
// scrim close it. It starts in the first field; with none, focus rests on the window itself. `locked`: the scrim does
// nothing, while the window holds what can't be shown again. Square, a hairline, no shadow; it rises 8px over 320ms.
// Vue's v-model:open is `open` with `onOpenChange` (or `defaultOpen` alone); the `foot` slot is the `foot` prop.
export interface DialogProps {
  title: string
  wide?: boolean
  locked?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  foot?: ReactNode
  children?: ReactNode
}

export function Dialog({ title, wide, locked, open: openProp, defaultOpen = false, onOpenChange, foot, children }: DialogProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      const field = d.querySelector<HTMLElement>('.ds-dialog-body :is(input:not([type="hidden"], [type="file"]), textarea, select):not(:disabled)')
      ;(field && field.getBoundingClientRect().bottom <= d.getBoundingClientRect().bottom ? field : d).focus()
    }
    else if (!open && d.open) d.close()
  }, [open])

  return (
    <>
      <style href="ds-dialog" precedence="ds">{css}</style>
      <dialog
        data-ds="dialog"
        ref={dialog}
        className="ds-dialog"
        data-wide={wide || undefined}
        tabIndex={-1}
        aria-label={title}
        onClose={() => setOpen(false)}
        // A click on the scrim lands on the dialog element itself.
        onClick={(event) => { if (event.target === dialog.current && !locked) setOpen(false) }}
      >
        <div className="flex items-center justify-between gap-4 pt-4 pr-4 pl-6">
          <h2 className="type-ui-strong">{title}</h2>
          <button type="button" className="inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge-strong hover:text-fg max-md:size-control-touch" aria-label="close" onClick={() => setOpen(false)}><X size={14} strokeWidth={1.5} /></button>
        </div>
        <div className="ds-dialog-body px-6 pt-4 pb-6">
          {children}
        </div>
        {foot && <div className="flex justify-end gap-2 px-6 pb-6">{foot}</div>}
      </dialog>
    </>
  )
}

export default Dialog

const css = `
.ds-dialog { width: min(480px, calc(100vw - 32px)); margin: auto; padding: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge); border-radius: var(--ds-radius-container); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-dialog[data-wide] { width: min(720px, calc(100vw - 32px)); }
.ds-dialog:focus { outline: none; }
.ds-dialog::backdrop { background: var(--ds-color-scrim); }
.ds-dialog[open] { animation: ds-dialog-rise var(--ds-duration-entrance) var(--ds-easing-standard); }
@keyframes ds-dialog-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .ds-dialog[open] { animation: ds-dialog-fade var(--ds-duration-enter) var(--ds-easing-standard); } }
@keyframes ds-dialog-fade { from { opacity: 0; } }
`
