'use client'
import { useState } from 'react'
import { CodeCopy } from '@/react/components/ui/CodeCopy'
import { cn } from '@/react/lib/cn'

// Code to read and copy (the console's CodeWindow.vue), one dark window on the site and in the product: a pill for
// each request or language and Copy on one row, a rule, then the code in 12px Geist Mono. There is always a pill: one
// names the code (`label`, else cURL for a curl command, else Shell), several pick it (`samples`). Copy takes all of
// it. Code reads left to right in every language.
export interface CodeBlockProps {
  code?: string
  label?: string
  samples?: { label: string, code: string }[]
  onCopied?: () => void
  className?: string
}

export function CodeBlock({ code, label, samples, onCopied, className }: CodeBlockProps) {
  const [picked, setPicked] = useState(0)
  const tabs = samples?.map(s => s.label) ?? [label ?? (code?.startsWith('curl') ? 'cURL' : 'Shell')]
  const shown = samples?.[picked]?.code ?? code ?? ''
  return (
    <div data-ds="code-block" className={cn('bg-code text-code-fg', className)} dir="ltr">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-[color-mix(in_srgb,var(--ds-color-off-white)_24%,transparent)] p-2">
        {tabs.length > 1
          ? (
              <div className="flex min-w-0 flex-wrap gap-0.5" role="tablist" aria-label={label ?? 'code'}>
                {tabs.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={picked === i}
                    className="inline-flex h-control-sm cursor-pointer items-center px-2.5 text-meta leading-5 font-medium text-code-muted transition-[color,background-color] duration-120 ease-standard hover:text-code-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface-accent aria-selected:bg-code-raised aria-selected:text-code-fg"
                    onClick={() => setPicked(i)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )
          : <div className="flex min-w-0"><span className="inline-flex h-control-sm min-w-0 items-center bg-code-raised px-2.5 text-meta leading-5 font-medium text-code-fg [overflow-wrap:anywhere]">{tabs[0]}</span></div>}
        <CodeCopy text={shown} onCopied={onCopied} />
      </div>
      <pre
        tabIndex={0}
        aria-label={`${tabs[samples ? picked : 0] ?? 'code'}, code`}
        className="m-0 overflow-x-auto px-4 py-3 type-code-sm leading-5 whitespace-pre focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface-accent"
      >{shown}</pre>
    </div>
  )
}

export default CodeBlock
