import type { ReactNode } from 'react'

// A key or a shortcut (console2.css .v2-side-search kbd): 11px in the face around it, no box, in the colour around it.
// `boxed` adds the prompt bar's hairline box (1px, 4px across). Hidden on touch screens, which have no keyboard to press
// it on. Several keys in one Kbd read as one shortcut: <Kbd>⌘K</Kbd>.
export interface KbdProps { boxed?: boolean, className?: string, children?: ReactNode }

export function Kbd({ boxed, className, children }: KbdProps) {
  return (
    <>
      <style href="ds-kbd" precedence="ds">{css}</style>
      <kbd data-ds="kbd" className={className ? `ds-kbd ${className}` : 'ds-kbd'} data-boxed={boxed || undefined}>{children}</kbd>
    </>
  )
}

export default Kbd

const css = `
.ds-kbd { font-family: inherit; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; }
.ds-kbd[data-boxed] { display: inline-block; padding: 0 4px; border: var(--ds-border-hairline) solid currentColor; border-color: color-mix(in srgb, currentColor 24%, transparent); }
@media (pointer: coarse) { .ds-kbd { display: none; } }
`
