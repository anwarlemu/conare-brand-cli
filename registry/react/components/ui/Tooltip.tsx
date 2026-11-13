'use client'
import { useEffect, useId, useRef, type FocusEvent, type PointerEvent, type ReactNode } from 'react'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { usePopover, type Align, type Side } from '@/react/hooks/usePopover'

// When the last tooltip closed: one opened right after it shows at once, so moving along a toolbar reads fast.
let lastClosed = 0

// A control's name, for icon buttons (Copy.vue version 1's tip): the inverse fill, 11px, 2px by 6px, 2px under its
// trigger. Under the pointer it waits 300ms, then fades and drops 2px in over 125ms; on keyboard focus it shows at
// once, without motion; a press, Escape or leaving hides it. Right after another tooltip it shows at once. It never
// shows on touch (a tap presses the button). Wrap one focusable trigger; it gets aria-describedby.
export interface TooltipProps { text: string, side?: Side, align?: Align, children?: ReactNode }

const WAIT = 300

export function Tooltip({ text, side = 'bottom', align = 'center', children }: TooltipProps) {
  const pop = usePopover({ side, align, gap: 2, sticky: true })
  const id = `tip-${useId()}`
  const root = useRef<HTMLSpanElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const trigger = root.current?.firstElementChild as HTMLElement | null
    pop.anchor.current = trigger
    trigger?.setAttribute('aria-describedby', id)
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const was = useRef(false)
  useEffect(() => {
    if (was.current && !pop.open) lastClosed = Date.now()
    was.current = pop.open
  }, [pop.open])
  useEffect(() => () => clearTimeout(timer.current), [])

  function enter(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || pop.open) return
    clearTimeout(timer.current)
    if (Date.now() - lastClosed < WAIT) return void pop.show({ keyboard: true })
    // ds-latency: the wait is the point; a pass of the pointer shows nothing.
    timer.current = setTimeout(() => void pop.show(), WAIT)
  }
  function leave() {
    clearTimeout(timer.current)
    pop.hide()
  }
  function focus(event: FocusEvent) {
    if ((event.target as HTMLElement).matches(':focus-visible')) void pop.show({ keyboard: true })
  }
  return (
    <>
      <span data-ds="tooltip" ref={root} className="inline-flex" onPointerEnter={enter} onPointerLeave={leave} onPointerDown={leave} onFocus={focus} onBlur={leave}>
        {children}
      </span>
      <PopoverPanel data-ds="tooltip" id={id} pop={pop} tip role="tooltip">{text}</PopoverPanel>
    </>
  )
}

export default Tooltip
