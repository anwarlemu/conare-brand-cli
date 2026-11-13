import { CodePop } from '@/react/components/ui/CodePop'
// The end of a search's results, where the code pop lives: the count, the run's time and duration, then the button.
// It starts open here to show it; the button closes it.
const code = `curl https://api.conare.ai/v1/namespaces/contracts/query \\
  -H "Authorization: Bearer $CONARE_API_KEY" \\
  -d '{ "query": "notice period to terminate a contract", "top_k": 5 }'`

export default function OpensInPlace() {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-meta text-fg-muted tabular-nums"><span className="text-fg-accent">5</span> of 2,811,549 documents</p>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-edge pt-3">
        <span className="inline-flex items-center bg-surface-subtle px-2 py-1 text-meta text-fg-soft tabular-nums">Done 4:34 PM</span>
        <span className="inline-flex items-center bg-surface-subtle px-2 py-1 text-meta text-fg-soft tabular-nums">257 ms</span>
        <CodePop code={code} opened />
      </div>
    </div>
  )
}
