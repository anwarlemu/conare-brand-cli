'use client'
import { Check, Copy } from 'lucide-react'
import { useCopy } from '@/react/hooks/useCopy'

// The code window's Copy (the console's CodeCopy.vue): on the dark bar, the icon and the word swap in one cell, so
// nothing moves. Used by CodeBlock; `light` is its form on the paper install line.
export interface CodeCopyProps {
  text: string
  light?: boolean
  onCopied?: () => void
}

export function CodeCopy({ text, light, onCopied }: CodeCopyProps) {
  const { copied, copy } = useCopy()
  async function run(t: string) {
    if (await copy(t)) onCopied?.()
  }
  return (
    <>
      <style href="ds-code-copy" precedence="ds">{css}</style>
      <button data-ds="code-copy" type="button" className="ds-codecopy" data-light={light || undefined} onClick={() => run(text)}>
        <span className="ds-codecopy-icon" aria-hidden="true"><Copy data-on={!copied || undefined} size={12} strokeWidth={1.5} /><Check data-on={copied || undefined} size={12} strokeWidth={2} /></span>
        <span className="ds-codecopy-word"><span data-on={!copied || undefined} aria-hidden={copied}>Copy</span><span data-on={copied || undefined} aria-hidden={!copied}>Copied</span></span>
        <span className="sr-only" aria-live="polite">{copied ? 'copied' : ''}</span>
      </button>
    </>
  )
}

export default CodeCopy

const css = `
.ds-codecopy { display: inline-flex; height: var(--ds-size-control-sm); flex-shrink: 0; align-items: center; gap: var(--ds-space-sm); padding: 0 10px; border: var(--ds-border-hairline) solid var(--ds-color-code-edge); background: var(--ds-color-code); color: var(--ds-color-code-fg); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: 20px; cursor: pointer; transition: border-color var(--ds-duration-micro) ease; }
.ds-codecopy:active { background: var(--ds-color-code-raised); }
@media (hover: hover) and (pointer: fine) { .ds-codecopy:hover { border-color: var(--ds-color-off-white); } }
.ds-codecopy:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-surface-accent); outline-offset: -2px; }
.ds-codecopy[data-light] { border-color: var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); }
.ds-codecopy[data-light]:active { background: var(--ds-color-surface-subtle); }
@media (hover: hover) and (pointer: fine) { .ds-codecopy[data-light]:hover { border-color: var(--ds-color-action-secondary-edge-hover); } }
.ds-codecopy-icon, .ds-codecopy-word { display: inline-grid; }
.ds-codecopy-icon > *, .ds-codecopy-word > * { grid-area: 1 / 1; transition: opacity var(--ds-duration-swap) ease-in-out, filter var(--ds-duration-swap) ease-in-out, transform var(--ds-duration-swap) ease-in-out; }
.ds-codecopy-icon > :not([data-on]) { opacity: 0; filter: blur(4px); transform: scale(0.25); }
.ds-codecopy-word > :not([data-on]) { opacity: 0; filter: blur(2px); }
.ds-codecopy-word > :first-child:not([data-on]) { transform: translateY(-4px); }
.ds-codecopy-word > :last-child:not([data-on]) { transform: translateY(4px); }
@media (prefers-reduced-motion: reduce) {
  .ds-codecopy-icon > *, .ds-codecopy-word > * { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
}
`
