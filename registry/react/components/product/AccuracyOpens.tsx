'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { Transition } from '@/react/lib/transition'

// A panel opening in place under its row (the console's RowOpen and Opens): the height grows from 0fr to 1fr on the
// strong ease-out, 180ms both ways as a table row, 200ms in and 140ms out as a list's; what is inside settles 4px as it
// fades in and only fades as it leaves, so nothing pops. Transitions, so a second click turns it around. With
// `colspan` it is a table row.
export interface AccuracyOpensProps extends HTMLAttributes<HTMLElement> {
  open: boolean
  colspan?: number
  children?: ReactNode
  'data-ds'?: string
}

export function AccuracyOpens({ open, colspan, children, ...rest }: AccuracyOpensProps) {
  return (
    <>
      <style href="ds-accuracy-opens" precedence="ds">{css}</style>
      {colspan
        ? (
            <Transition show={open} name="ds-opens" duration={180}>
              <tr data-ds="accuracy-opens" className="ds-opens-row" {...rest}>
                <td colSpan={colspan}><div className="ds-opens-grow"><div>{children}</div></div></td>
              </tr>
            </Transition>
          )
        : (
            <Transition show={open} name="ds-opens" duration={{ enter: 200, leave: 140 }}>
              <div data-ds="accuracy-opens" className="ds-opens-list" {...rest}><div className="ds-opens-grow"><div>{children}</div></div></div>
            </Transition>
          )}
    </>
  )
}

export default AccuracyOpens

const css = `
.ds-opens-row > td { height: 0; max-width: 0; padding: 0 !important; background: var(--ds-color-surface-subtle); white-space: normal; }
.ds-opens-grow { display: grid; grid-template-rows: 1fr; }
.ds-opens-grow > div { min-height: 0; }
:is(.ds-opens-enter-from, .ds-opens-leave-to) .ds-opens-grow { grid-template-rows: 0fr; }
:is(.ds-opens-enter-active, .ds-opens-leave-active) .ds-opens-grow { transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
.ds-opens-list:is(.ds-opens-enter-active) .ds-opens-grow { transition-duration: var(--ds-duration-enter); }
.ds-opens-list:is(.ds-opens-leave-active) .ds-opens-grow { transition-duration: var(--ds-duration-fade); }
:is(.ds-opens-enter-active, .ds-opens-leave-active) .ds-opens-grow > div { overflow: hidden; }
.ds-opens-enter-active .ds-opens-grow > div { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-opens-leave-active .ds-opens-grow > div { transition: opacity var(--ds-duration-cell) var(--ds-easing-out); }
.ds-opens-enter-from .ds-opens-grow > div { opacity: 0; transform: translateY(-4px); }
.ds-opens-leave-to .ds-opens-grow > div { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  :is(.ds-opens-enter-active, .ds-opens-leave-active) :is(.ds-opens-grow, .ds-opens-grow > div) { transition: none; }
}
`
