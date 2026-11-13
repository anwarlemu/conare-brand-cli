'use client'
import type { ReactNode } from 'react'
import { AccordionContext } from '@/react/hooks/useAccordion'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// A stack of disclosures, built in Conare's style from the console's disclosure (.v2-collapse, .c-details) and the
// website's FAQ: hairlines between rows, a 12px muted chevron that turns as a row opens, the row's height opening from
// 0fr to 1fr over 260ms and closing in 180ms on the strong ease-out, its words fading down into place a beat after.
// One open at a time by default (a second press closes it); `multiple` lets several stay open. Vue's v-model is
// `value` with `onValueChange` (or `defaultValue` alone): the open item's value (or the list of them with `multiple`).
// Compose with AccordionItem.
export type AccordionValue = string | string[] | null
export interface AccordionProps {
  multiple?: boolean
  value?: AccordionValue
  defaultValue?: AccordionValue
  onValueChange?: (value: AccordionValue) => void
  className?: string
  children?: ReactNode
}

export function Accordion({ multiple, value, defaultValue = null, onValueChange, className, children }: AccordionProps) {
  const [model, setModel] = useControllable<AccordionValue>(value, defaultValue, onValueChange)
  const list = Array.isArray(model) ? model : model ? [model] : []
  const ctx = {
    isOpen: (v: string) => list.includes(v),
    toggle: (v: string) => {
      if (multiple) setModel(list.includes(v) ? list.filter(x => x !== v) : [...list, v])
      else setModel(list.includes(v) ? null : v)
    },
  }
  return (
    <AccordionContext.Provider value={ctx}>
      <div data-ds="accordion" className={cn('ds-accordion border-t border-edge', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

export default Accordion
