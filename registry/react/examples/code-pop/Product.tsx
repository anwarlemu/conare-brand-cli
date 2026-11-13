import { CodePop } from '@/react/components/ui/CodePop'
// Closed, as a search's results end: press Show code and the request takes its own line under the row.
const code = `curl https://api.conare.ai/v1/namespaces/contracts/query \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -d '{ "query": "notice period to terminate a contract", "top_k": 5 }'`

export default function Product() {
  return (
    <div className="flex min-h-85 max-w-180 flex-col justify-end gap-3">
      <p className="type-meta text-fg-muted tabular-nums"><span className="text-fg-accent">5</span> of 2,811,549 documents</p>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-edge pt-3">
        <span className="inline-flex items-center bg-surface-subtle px-2 py-1 text-meta text-fg-soft tabular-nums">Done 4:34 PM</span>
        <span className="inline-flex items-center bg-surface-subtle px-2 py-1 text-meta text-fg-soft tabular-nums">257 ms</span>
        <CodePop code={code} />
      </div>
    </div>
  )
}
