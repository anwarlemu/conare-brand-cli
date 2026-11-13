'use client'
import { ChevronDown, Code } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { CodeBlock } from '@/react/components/ui/CodeBlock'

// Code that opens from its own button (the console's CodePop.vue, version 2, the one picked): no overlay, the code
// takes its own line under the row, in the dark code window, and pushes what follows. The row grows from 0fr over
// 200ms (back in 140ms), the window settles 6px down into place, and the label swaps to "Hide code" in the same box,
// so the button keeps its width. The chevron turns as it opens and starts turning on the press. The trigger and the
// code sit in the caller's row (display: contents): put it in a wrapping flex row; it takes the row's end. `large`
// is the 36px size, beside a large dark button.
export interface CodePopProps {
  code: string
  label?: string
  title?: string
  tab?: string
  opened?: boolean
  large?: boolean
}

export function CodePop({ code, label = 'Show code', title = 'This request in your code', tab, opened, large }: CodePopProps) {
  const id = `codepop-${useId()}`
  const [open, setOpen] = useState(!!opened)
  const panel = useRef<HTMLDivElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  // It opens under its button, which can sit low on the screen, so the code lands in view once the row has grown.
  function toggle() {
    const next = !open
    setOpen(next)
    clearTimeout(timer.current)
    // ds-latency: waits for the row to finish growing before bringing it into view; the code shows at once.
    if (next) timer.current = setTimeout(() => panel.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 200)
  }
  return (
    <div data-ds="code-pop" className="contents" data-codepop="">
      <style href="ds-code-pop" precedence="ds">{css}</style>
      <button type="button" className="ds-codepop-btn" data-large={large || undefined} aria-expanded={open} aria-controls={id} onClick={toggle}>
        <Code size={12} strokeWidth={1.5} aria-hidden="true" />
        <span className="ds-codepop-stack"><span data-on={!open || undefined} aria-hidden={open}>{label}</span><span data-on={open || undefined} aria-hidden={!open}>Hide code</span></span>
        <ChevronDown size={12} strokeWidth={1.5} className="ds-codepop-chev" aria-hidden="true" />
      </button>
      <div id={id} ref={panel} className="ds-codepop" data-open={open || undefined} inert={!open} role="region" aria-label={title}>
        <div className="ds-codepop-clip">
          <CodeBlock className="ds-codepop-win" code={code} label={tab} />
        </div>
      </div>
    </div>
  )
}

export default CodePop

const css = `
.ds-codepop-btn { display: inline-flex; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; gap: var(--ds-space-sm); margin-left: auto; padding: 0 10px; border: var(--ds-border-hairline) solid transparent; color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); white-space: nowrap; cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-codepop-btn:hover { border-color: var(--ds-color-edge); color: var(--ds-color-fg); } }
.ds-codepop-btn:active { background: var(--ds-color-surface-subtle); }
.ds-codepop-btn:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-border-focus); }
.ds-codepop-stack { display: inline-grid; }
.ds-codepop-stack > * { grid-area: 1 / 1; transition: opacity var(--ds-duration-swap) var(--ds-easing-out), filter var(--ds-duration-swap) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-codepop-stack > :not([data-on]) { opacity: 0; filter: blur(2px); }
.ds-codepop-stack > :first-child:not([data-on]) { transform: translateY(-4px); }
.ds-codepop-stack > :last-child:not([data-on]) { transform: translateY(4px); }
.ds-codepop-chev { flex-shrink: 0; transition: rotate var(--ds-duration-micro) var(--ds-easing-out); }
.ds-codepop-btn[aria-expanded="true"] .ds-codepop-chev { rotate: 180deg; transition-duration: var(--ds-duration-slide); }
.ds-codepop-btn:active .ds-codepop-chev { rotate: 24deg; }
.ds-codepop-btn[aria-expanded="true"]:active .ds-codepop-chev { rotate: 156deg; }
.ds-codepop { display: grid; flex-basis: 100%; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-fade) var(--ds-easing-out); }
.ds-codepop[data-open] { grid-template-rows: 1fr; transition-duration: var(--ds-duration-enter); }
.ds-codepop-clip { min-width: 0; min-height: 0; overflow: hidden; }
.ds-codepop-win { margin-top: 8px; opacity: 0; translate: 0 -6px; transition: opacity var(--ds-duration-cell) var(--ds-easing-out), translate var(--ds-duration-fade) var(--ds-easing-out); }
.ds-codepop[data-open] .ds-codepop-win { opacity: 1; translate: 0 0; transition: opacity var(--ds-duration-fade) var(--ds-easing-out), translate var(--ds-duration-enter) var(--ds-easing-out); }

.ds-codepop-btn[data-large] { height: var(--ds-size-control-lg); padding: 0 12px; font-size: var(--ds-text-ui); }
@media (pointer: coarse), (max-width: 767px) { .ds-codepop-btn, .ds-codepop-btn[data-large] { height: var(--ds-size-control-touch); font-size: var(--ds-text-ui); } }
@media (prefers-reduced-motion: reduce) {
  .ds-codepop-stack > * { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
  .ds-codepop, .ds-codepop-win, .ds-codepop-chev { translate: none; transition: none; }
  .ds-codepop-btn:active .ds-codepop-chev { rotate: none; }
}
`
