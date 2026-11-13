'use client'
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/react/lib/cn'
import { useControllable } from '@/react/hooks/useControllable'

// Two panes and the hairline between them (new in Conare's style, from the docs panel's split: a 1px edge beside the
// page). The handle is the hairline itself with an 8px reach either side; it turns ink under the pointer, while
// dragged and when focused. Drag it, or focus it and use the arrow keys (Shift for bigger steps, Home and End for the
// limits). The value is the first pane's share in percent, held between `min` and `max` (Vue's v-model: `value` with
// `onValueChange`, or `defaultValue` alone). The panes go in `first` and `second`.
export interface ResizableProps {
  direction?: 'horizontal' | 'vertical'
  min?: number
  max?: number
  label?: string
  value?: number
  defaultValue?: number
  onValueChange?: (size: number) => void
  first?: ReactNode
  second?: ReactNode
  className?: string
}

export function Resizable({ direction = 'horizontal', min = 20, max = 80, label = 'resize panes', value, defaultValue = 50, onValueChange, first, second, className }: ResizableProps) {
  const [size, setSize] = useControllable(value, defaultValue, onValueChange)
  const root = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const firstId = `pane-${useId()}`
  const across = direction === 'horizontal'
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 10) / 10))

  function onDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging || !root.current) return
    const box = root.current.getBoundingClientRect()
    setSize(clamp(across ? ((e.clientX - box.left) / box.width) * 100 : ((e.clientY - box.top) / box.height) * 100))
  }
  function onUp(e: PointerEvent<HTMLDivElement>) {
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 10 : 2
    const back = across ? 'ArrowLeft' : 'ArrowUp'
    const fwd = across ? 'ArrowRight' : 'ArrowDown'
    if (e.key === back) setSize(clamp(size - step))
    else if (e.key === fwd) setSize(clamp(size + step))
    else if (e.key === 'Home') setSize(min)
    else if (e.key === 'End') setSize(max)
    else return
    e.preventDefault()
  }

  return (
    <>
      <style href="ds-resizable" precedence="ds">{css}</style>
      <div data-ds="resizable" ref={root} className={cn('flex min-h-0 min-w-0', [across ? 'flex-row' : 'flex-col', dragging && 'select-none'], className)}>
        <div id={firstId} className="min-h-0 min-w-0 overflow-auto" style={{ flexBasis: `${size}%` }}>{first}</div>
        <div
          className="ds-resize-handle"
          data-direction={direction}
          data-dragging={dragging || undefined}
          role="separator"
          tabIndex={0}
          aria-label={label}
          aria-orientation={across ? 'vertical' : 'horizontal'}
          aria-controls={firstId}
          aria-valuenow={size}
          aria-valuemin={min}
          aria-valuemax={max}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        />
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">{second}</div>
      </div>
    </>
  )
}

export default Resizable

const css = `
.ds-resize-handle { position: relative; flex-shrink: 0; background: var(--ds-color-edge); touch-action: none; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-resize-handle[data-direction="horizontal"] { width: var(--ds-border-hairline); cursor: col-resize; }
.ds-resize-handle[data-direction="vertical"] { height: var(--ds-border-hairline); cursor: row-resize; }
/* The reach: 8px either side of the hairline, 20px on touch. */
.ds-resize-handle::before { position: absolute; content: ""; }
.ds-resize-handle[data-direction="horizontal"]::before { inset: 0 calc(var(--ds-space-md) * -1); }
.ds-resize-handle[data-direction="vertical"]::before { inset: calc(var(--ds-space-md) * -1) 0; }
@media (pointer: coarse) {
  .ds-resize-handle[data-direction="horizontal"]::before { inset: 0 -20px; }
  .ds-resize-handle[data-direction="vertical"]::before { inset: -20px 0; }
}
.ds-resize-handle[data-dragging], .ds-resize-handle:focus-visible { background: var(--ds-color-edge-focus); }
.ds-resize-handle:focus-visible { outline: none; }
@media (hover: hover) and (pointer: fine) { .ds-resize-handle:hover { background: var(--ds-color-edge-focus); } }
`
