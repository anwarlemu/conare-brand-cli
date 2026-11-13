'use client'
import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from 'react'
import { Button } from '@/react/components/ui/Button'
import { useControllable } from '@/react/hooks/useControllable'

// A question that needs an answer before anything else (Dialog's window, Modal.vue): the title, one line saying what
// happens, then Cancel and the action, the danger button for what removes something. Focus starts on Cancel; the scrim
// does nothing, so only a choice closes it; Escape cancels and focus returns to what opened it. It rises 8px over
// 320ms, as Dialog. In a row, a held danger button (HoldButton) is better: it confirms without interrupting. Vue's
// v-model:open is `open` with `onOpenChange` (or `defaultOpen` alone); its events are `onConfirm` and `onCancel`.
export interface AlertDialogProps {
  title: string
  description: string
  action: string
  cancel?: string
  danger?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
  onCancel?: () => void
  children?: ReactNode
}

export function AlertDialog({ title, description, action, cancel = 'Cancel', danger = true, open: openProp, defaultOpen = false, onOpenChange, onConfirm, onCancel, children }: AlertDialogProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)
  const id = useId()
  const returnTo = useRef<HTMLElement | null>(null)
  const mounted = useRef(false)

  useEffect(() => {
    const d = dialog.current
    const first = !mounted.current
    mounted.current = true
    if (!d) return
    if (open) {
      if (d.open) return
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      d.showModal()
      d.querySelector<HTMLElement>('[data-cancel]')?.focus()
    }
    else if (!first) {
      if (d.open) d.close()
      returnTo.current?.focus({ preventScroll: true })
      returnTo.current = null
    }
  }, [open])

  function cancelled(event: SyntheticEvent) {
    event.preventDefault()
    onCancel?.()
    setOpen(false)
  }
  function choose(confirmed: boolean) {
    if (confirmed) onConfirm?.()
    else onCancel?.()
    setOpen(false)
  }
  return (
    <>
      <style href="ds-alert-dialog" precedence="ds">{css}</style>
      <dialog data-ds="alert-dialog" ref={dialog} className="ds-alert" role="alertdialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-text`} onCancel={cancelled}>
        <h2 id={`${id}-title`} className="type-ui-strong">{title}</h2>
        <p id={`${id}-text`} className="mt-2 type-ui text-fg-soft">{description}</p>
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <Button data-cancel onClick={() => choose(false)}>{cancel}</Button>
          <Button variant={danger ? 'danger' : 'dark'} onClick={() => choose(true)}>{action}</Button>
        </div>
      </dialog>
    </>
  )
}

export default AlertDialog

const css = `
.ds-alert { width: min(400px, calc(100vw - 32px)); margin: auto; padding: var(--ds-space-2xl); border: var(--ds-border-hairline) solid var(--ds-color-edge); border-radius: var(--ds-radius-container); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-alert::backdrop { background: var(--ds-color-scrim); }
.ds-alert[open] { animation: ds-alert-rise var(--ds-duration-entrance) var(--ds-easing-standard); }
@keyframes ds-alert-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .ds-alert[open] { animation: ds-alert-fade var(--ds-duration-enter) var(--ds-easing-standard); } }
@keyframes ds-alert-fade { from { opacity: 0; } }
`
