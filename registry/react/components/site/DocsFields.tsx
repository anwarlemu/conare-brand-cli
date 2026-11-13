import { DocsInline } from '@/react/components/site/DocsInline'
import { cn } from '@/react/lib/cn'

// An endpoint's parameters or fields (docs/Fields.vue), one ruled row each: the name in the mono, its type and
// "required" or its default beside it, then what it is and its limits. A field's own fields sit under it behind a
// toggle, in the same rows a step in; the toggle's plus turns to a minus when open.
export type DocsField = { name: string, type: string, required?: boolean, default?: string, text?: string, notes?: string[], children?: DocsField[] }

export interface DocsFieldsProps {
  fields: DocsField[]
  nested?: boolean
  className?: string
}

export function DocsFields({ fields, nested, className }: DocsFieldsProps) {
  return (
    <>
      <style href="ds-docs-fields" precedence="ds">{css}</style>
      <ul data-ds="docs-fields" className={cn('ds-docs-params flex flex-col', nested && 'border-s border-edge ps-4', className)}>
        {fields.map(f => (
          <li key={f.name} className="py-4">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 type-code" dir="ltr">
              <span className="font-medium text-fg">{f.name}</span>
              <span className="ds-docs-tag">{f.type}</span>
              {f.required && <span className="ds-docs-tag" data-required="">required</span>}
              {f.default !== undefined && <span className="ds-docs-tag">{`default: ${f.default}`}</span>}
            </p>
            {f.text && <p className="mt-2 type-body-lg text-fg-muted"><DocsInline text={f.text} /></p>}
            {f.notes?.map(n => <p key={n} className="mt-1.5 type-ui text-fg-muted"><DocsInline text={n} /></p>)}
            {f.children && (
              <details className="ds-docs-more mt-3">
                <summary className="ds-docs-btn inline-flex h-7 cursor-pointer list-none items-center gap-1.5 px-2.5 text-meta leading-4">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" className="ds-docs-sign"><path d="M5 1.5v7M1.5 5h7" /></svg>
                  {`${f.children.length} ${f.children.length === 1 ? 'field' : 'fields'}`}
                </summary>
                <DocsFields fields={f.children} nested className="mt-2" />
              </details>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default DocsFields

const css = `
.ds-docs-params > li + li { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-docs-tag { border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); padding: 0 calc(var(--ds-space-xs) + 1px); font-size: var(--ds-text-caption); line-height: 18px; color: var(--ds-color-fg-muted); }
.ds-docs-tag[data-required] { border-color: color-mix(in srgb, var(--ds-color-edge-accent) 40%, transparent); background: var(--ds-color-surface-danger); color: var(--ds-color-edge-accent); }
.ds-docs-btn { border: var(--ds-border-hairline) solid var(--ds-color-edge); color: var(--ds-color-fg); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-docs-btn:hover { background: var(--ds-color-surface-subtle); } }
.ds-docs-more summary::-webkit-details-marker { display: none; }
.ds-docs-more[open] > summary .ds-docs-sign path { d: path("M1.5 5h7"); }
`
