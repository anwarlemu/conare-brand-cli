import { Fragment } from 'react'
import { citeParts } from '@/react/hooks/useSearchResults'

// A written answer's words at 16px with its sources as small ink squares, [1] and [2] in the text becoming numbered
// buttons (console2.css .v2-written-text, .v2-cite). A citation turns red under the pointer and while it is the one
// shown (`pointed`). The words rise in once, a blur clearing (.v2-answer-in).
export interface AnswerTextProps {
  text: string
  pointed?: number
  onCite?: (n: number) => void
  onPoint?: (n: number) => void
}

export function AnswerText({ text, pointed, onCite, onPoint }: AnswerTextProps) {
  return (
    <p data-ds="answer-text" className="ds-answer-text">
      <style href="ds-answer-text" precedence="ds">{css}</style>
      {citeParts(text).map((p, i) => ('cite' in p
        ? <button key={i} type="button" className="ds-cite" aria-label={`Source ${p.cite}`} aria-pressed={pointed === undefined ? undefined : pointed === p.cite} onPointerEnter={() => onPoint?.(p.cite)} onFocus={() => onPoint?.(p.cite)} onClick={() => onCite?.(p.cite)}>{p.cite}</button>
        : <Fragment key={i}>{p.words}</Fragment>))}
    </p>
  )
}

export default AnswerText

const css = `
.ds-answer-text { margin: 0; font-size: var(--ds-text-input); line-height: var(--ds-text-input-leading); animation: ds-answer-in var(--ds-duration-rise) var(--ds-easing-out) both; }
@keyframes ds-answer-in { from { opacity: 0; filter: blur(2px); transform: translateY(4px); } }
.ds-cite { position: relative; display: inline-flex; min-width: 16px; height: 16px; align-items: center; justify-content: center; margin-inline: 2px; background: var(--ds-color-fg); color: var(--ds-color-fg-inverse); font-size: var(--ds-text-meta); line-height: 16px; vertical-align: 2px; font-variant-numeric: tabular-nums; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); touch-action: manipulation; }
/* Small to the eye, larger to the pointer: 24px, 40px on touch. */
.ds-cite::after { position: absolute; inset: -4px; content: ""; }
.ds-cite[aria-pressed="true"] { background: var(--ds-color-home-red-press); }
@media (hover: hover) and (pointer: fine) { .ds-cite:hover { background: var(--ds-color-home-red-press); } }
.ds-cite:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 2px; }
@media (pointer: coarse) { .ds-cite::after { inset: -12px; } }
@media (prefers-reduced-motion: reduce) { .ds-answer-text { animation-name: ds-answer-fade; } }
@keyframes ds-answer-fade { from { opacity: 0; } }
`
