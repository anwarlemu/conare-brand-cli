import { CopyText } from '@/react/components/ui/CopyText'
// A key's ID and a custom model, as the keys and models pages list them.

export default function Product() {
  return (
    <dl className="grid max-w-120 grid-cols-[96px_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
      <dt className="type-meta text-fg-muted">ID</dt><dd className="min-w-0"><CopyText value="key_01JB7Q4ZK2M8F3" label="key id" /></dd>
      <dt className="type-meta text-fg-muted">Embedder</dt><dd className="min-w-0"><CopyText value="acme-embed-legal-v2" label="embedder model" /></dd>
    </dl>
  )
}
