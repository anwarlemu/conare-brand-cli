'use client'
import { useId, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAccordion } from '@/react/hooks/useAccordion'
import { cn } from '@/react/lib/cn'

// One row of an Accordion: the question as a full-width button (40px, 13px soft text that turns ink under the pointer
// and while open) over a hairline, and the answer under it. The closed answer is inert, so its links leave the tab
// order. `title` names the row (a string, or a node for Vue's `title` slot); children are the answer.
export interface AccordionItemProps { value: string, title?: ReactNode, disabled?: boolean, children?: ReactNode }

export function AccordionItem({ value, title, disabled, children }: AccordionItemProps) {
  const ctx = useAccordion()
  const open = ctx?.isOpen(value) ?? false
  const id = useId()
  return (
    <>
      <style href="ds-accordion-item" precedence="ds">{css}</style>
      <div data-ds="accordion-item" className="border-b border-edge" data-open={open}>
        <h3>
          <button
            id={`${id}-head`}
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-body`}
            disabled={disabled}
            className="flex min-h-row w-full cursor-pointer items-center justify-between gap-3 py-2 text-left type-ui text-fg-soft transition-colors duration-120 ease-standard hover:text-fg aria-expanded:text-fg disabled:cursor-default disabled:text-fg-muted"
            onClick={() => ctx?.toggle(value)}
          >
            {title}
            <ChevronDown size={12} strokeWidth={1.5} aria-hidden="true" className={cn('shrink-0 text-fg-muted transition-[rotate] duration-200 ease-standard motion-reduce:transition-none', open && 'rotate-180')} />
          </button>
        </h3>
        <div id={`${id}-body`} role="region" aria-labelledby={`${id}-head`} inert={!open} className="ds-collapse" data-open={open}>
          <div><div className="ds-collapse-body pb-3 type-ui text-fg-soft">{children}</div></div>
        </div>
      </div>
    </>
  )
}

export default AccordionItem

const css = `
/* The console's disclosure (console2.css .v2-collapse): open over 260ms, close in 180ms, the words fading and
   settling 6px down with a 2px blur that clears, so the text never pops. Reduced motion: no height or move, opacity only. */
.ds-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
.ds-collapse[data-open="true"] { grid-template-rows: 1fr; transition-duration: var(--ds-duration-collapse); }
.ds-collapse > div { min-height: 0; overflow: hidden; }
.ds-collapse-body { opacity: 0; filter: blur(2px); transform: translateY(-6px); transition: opacity var(--ds-duration-micro) ease, filter var(--ds-duration-micro) ease, transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-collapse[data-open="true"] .ds-collapse-body { opacity: 1; filter: none; transform: none; transition: opacity var(--ds-duration-settle) ease 40ms, filter var(--ds-duration-settle) ease 40ms, transform var(--ds-duration-collapse) var(--ds-easing-out) 40ms; }
@media (prefers-reduced-motion: reduce) {
  .ds-collapse, .ds-collapse[data-open="true"] { transition: none; }
  .ds-collapse-body, .ds-collapse[data-open="true"] .ds-collapse-body { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
}
`
