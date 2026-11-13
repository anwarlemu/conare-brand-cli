import { Layers } from 'lucide-react'
import { HoverCard } from '@/react/components/ui/HoverCard'
// A namespace named in a sentence; rest the pointer on it (or tab to it) and its card shows what it holds and where it
// comes from. The link still works on its own.

export default function Product() {
  return (
    <div className="flex min-h-56 items-start justify-center">
      <p className="max-w-90 type-ui text-fg-soft">
        Answers about notice periods come from
        {' '}
        <HoverCard
          card={(
            <>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-5 items-center justify-center border border-edge bg-surface-subtle text-fg-muted" aria-hidden="true"><Layers size={12} strokeWidth={1.5} /></span>
                <span className="type-code-sm text-fg">contracts</span>
              </div>
              <p className="mt-2 type-meta text-fg-soft">Signed agreements and their amendments, synced from Acme drive every hour.</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-edge pt-3 type-meta">
                <dt className="text-fg-muted">Documents</dt><dd className="text-right tabular-nums">412,830</dd>
                <dt className="text-fg-muted">Last sync</dt><dd className="text-right tabular-nums">4 min ago</dd>
              </dl>
            </>
          )}
        >
          <a href="#" className="font-code text-meta text-fg underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-120 ease-standard hover:decoration-fg" onClick={e => e.preventDefault()}>contracts</a>
        </HoverCard>
        , the namespace your agents search first.
      </p>
    </div>
  )
}
