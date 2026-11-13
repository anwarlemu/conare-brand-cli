'use client'
import { useEffect, useId, useImperativeHandle, useRef, type ReactNode, type Ref, type MouseEvent } from 'react'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { firstFocusable, usePopover, type Align, type Side } from '@/react/hooks/usePopover'

// Menu's square panel for any content (a short form, a few settings, a note): the trigger's content is `trigger`,
// drawn as a secondary button unless `triggerClass` says otherwise. Opening moves focus to the panel's first control
// (or the panel); Escape, a press outside or tabbing away closes it, and Escape returns focus to the trigger. It flips
// to the side with room and stays 8px inside the viewport. children may be a function of `close` (Vue's slot prop).
// Vue's v-model:open is `open` with `onOpenChange`; `ref` gets { close }.
export interface PopoverProps {
  label: string
  side?: Side
  align?: Align
  width?: string
  triggerClass?: string
  triggerLabel?: string
  trigger?: ReactNode | ((open: boolean) => ReactNode)
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode | ((close: (refocus?: boolean) => void) => ReactNode)
  ref?: Ref<{ close: (refocus?: boolean) => void }>
}

export function Popover({ label, side = 'bottom', align = 'start', width = '280px', triggerClass, triggerLabel, trigger, open, onOpenChange, children, ref }: PopoverProps) {
  const pop = usePopover({ side, align })
  const id = `popover-${useId()}`
  const close = (refocus = true) => pop.hide(refocus)
  useImperativeHandle(ref, () => ({ close }))

  async function show(keyboard = false) {
    await pop.show({ keyboard })
    ;(firstFocusable(pop.panel.current) ?? pop.panel.current)?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (open && !pop.open) void show()
    if (open === false && pop.open) pop.hide()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const report = useRef(onOpenChange)
  report.current = onOpenChange
  const was = useRef(pop.open)
  useEffect(() => {
    if (was.current !== pop.open) report.current?.(pop.open)
    was.current = pop.open
  }, [pop.open])
  // A click from the keyboard has no pointer detail: the panel opens and closes at once.
  function onClick(event: MouseEvent) {
    const keyboard = event.detail === 0
    if (pop.open) pop.hide(keyboard, keyboard)
    else void show(keyboard)
  }
  return (
    <>
      <button
        data-ds="popover"
        ref={(el) => { pop.anchor.current = el }}
        type="button"
        className={triggerClass ?? 'inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-action-secondary-edge bg-surface px-2.5 text-meta leading-5 font-medium text-fg transition-[border-color,background-color] duration-120 ease-standard hover:border-action-secondary-edge-hover active:bg-surface-subtle aria-expanded:border-action-secondary-edge-hover max-md:h-control-touch max-md:text-ui'}
        aria-haspopup="dialog"
        aria-expanded={pop.open}
        aria-controls={pop.open ? id : undefined}
        aria-label={triggerLabel}
        onClick={onClick}
      >
        {typeof trigger === 'function' ? trigger(pop.open) : trigger}
      </button>
      <PopoverPanel data-ds="popover" id={id} pop={pop} role="dialog" aria-label={label} tabIndex={-1} className="p-3" style={{ width }}>
        {typeof children === 'function' ? children(close) : children}
      </PopoverPanel>
    </>
  )
}

export default Popover
