import { ScrollArea } from '@/react/components/ui/ScrollArea'
// A long list of documents in a short box, and a wide row of tags that scrolls sideways on its own.

const docs = Array.from({ length: 24 }, (_, i) => ({ id: `acme-contract-${String(i + 1).padStart(3, '0')}.pdf`, pages: 4 + ((i * 7) % 30) }))
const tags = ['contracts', 'support', 'crm', 'slack', 'drive', 'notion', 'gmail', 'billing', 'sales-calls', 'legal', 'hr', 'engineering']

export default function Product() {
  return (
    <div className="flex flex-col gap-6">
      <ScrollArea label="documents" maxHeight="240px" className="w-full max-w-sm border border-edge">
        <ul>
          {docs.map(d => (
            <li key={d.id} className="flex h-10 items-center justify-between gap-4 border-b border-edge px-3 last:border-b-0">
              <span className="truncate type-code-sm">{d.id}</span>
              <span className="type-meta text-fg-muted tabular-nums">{d.pages} pages</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <ScrollArea label="namespaces" axis="x" className="w-full max-w-sm border border-edge">
        <div className="flex w-max gap-2 p-3">
          {tags.map(t => <span key={t} className="border border-edge px-2 type-code-sm leading-6">{t}</span>)}
        </div>
      </ScrollArea>
    </div>
  )
}
