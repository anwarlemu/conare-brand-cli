import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A region that scrolls on its own with the console's thin scrollbars (main.css html: scrollbar-width thin, the thumb
// in neutral-600 on a clear track; on the dark window, neutral-400 as .v2-agentwin-code). Native scrolling, so wheel,
// touch and keyboard all work; with a `label` it is a named region a keyboard can reach. `maxHeight` caps it; `axis`
// picks the direction.
export interface ScrollAreaProps { label?: string, maxHeight?: string, axis?: 'y' | 'x' | 'both', tone?: 'default' | 'dark', className?: string, children?: ReactNode }

export function ScrollArea({ label, maxHeight, axis = 'y', tone = 'default', className, children }: ScrollAreaProps) {
  return (
    <>
      <style href="ds-scroll-area" precedence="ds">{css}</style>
      <div
        data-ds="scroll-area"
        className={cn('ds-scroll overscroll-contain', axis === 'y' && 'fade-y overflow-y-auto overflow-x-hidden', axis === 'x' && 'fade-x overflow-x-auto overflow-y-hidden', axis === 'both' && 'fade-xy overflow-auto', className)}
        data-tone={tone}
        style={maxHeight ? { maxHeight } : undefined}
        role={label ? 'region' : undefined}
        aria-label={label}
        tabIndex={label ? 0 : undefined}
      >
        {children}
      </div>
    </>
  )
}

export default ScrollArea

const css = `
.ds-scroll { scrollbar-width: thin; scrollbar-color: var(--ds-color-neutral-600) transparent; }
.ds-scroll[data-tone="dark"] { scrollbar-color: var(--ds-color-neutral-400) transparent; }
.ds-scroll:focus-visible { outline-offset: calc(var(--ds-border-focus) * -1); }
`
