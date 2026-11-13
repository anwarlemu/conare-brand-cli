import { Fragment } from 'react'

// A line of docs text with its `code`, **bold** and [links](href) set (docs/Inline.vue): code in the mono on the
// paper, bold in ink, links in the red with a quiet underline that turns full under the pointer.
type Part = { kind: 'text' | 'code' | 'bold', text: string } | { kind: 'link', text: string, href: string }

export function docsParts(text: string): Part[] {
  const out: Part[] = []
  const re = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ kind: 'code', text: m[1] })
    else if (m[4] !== undefined) out.push({ kind: 'bold', text: m[4] })
    else out.push({ kind: 'link', text: m[2]!, href: m[3]! })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
  return out
}

export interface DocsInlineProps { text: string }

export function DocsInline({ text }: DocsInlineProps) {
  return (
    <>
      <style href="ds-docs-inline" precedence="ds">{css}</style>
      {docsParts(text).map((p, i) => (p.kind === 'code'
        ? <code key={i} data-ds="docs-inline" dir="ltr" className="ds-docs-code">{p.text}</code>
        : p.kind === 'link'
          ? <a key={i} data-ds="docs-inline" href={p.href} className="ds-docs-link">{p.text}</a>
          : p.kind === 'bold'
            ? <strong key={i} data-ds="docs-inline" className="font-medium text-fg">{p.text}</strong>
            : <Fragment key={i}>{p.text}</Fragment>))}
    </>
  )
}

export default DocsInline

const css = `
.ds-docs-code { border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); padding: 0 var(--ds-space-xs); font-family: var(--ds-font-code); font-size: 0.86em; }
.ds-docs-link { color: var(--ds-color-edge-accent); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--ds-color-edge-accent) 40%, transparent); text-underline-offset: 3px; transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-docs-link:hover { text-decoration-color: var(--ds-color-edge-accent); } }
`
