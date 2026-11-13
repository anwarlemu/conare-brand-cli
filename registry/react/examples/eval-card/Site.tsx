import { EvalCard } from '@/react/components/site/EvalCard'
// Two benchmarks as the evals page sets them. Ours is kept in the top five, in red, wherever it ranks.
const retrieval = [
  { name: 'Acme embed 1', value: 67.02, ours: true },
  { name: 'Provider B, page images', value: 66.48 },
  { name: 'Provider B, page text', value: 66.1 },
  { name: 'Provider C, page images', value: 64.24 },
  { name: 'Provider C, page text', value: 62.25 },
  { name: 'Provider D', value: 60.64 },
  { name: 'BM25', value: 49.68 },
]
const latency = [
  { name: 'Provider B', value: 182 },
  { name: 'Provider C', value: 240 },
  { name: 'Provider D', value: 251 },
  { name: 'Provider E', value: 266 },
  { name: 'Provider F', value: 301 },
  { name: 'Acme rerank 1', value: 318, ours: true },
]

export default function Site() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <EvalCard href="#retrieval" name="Document retrieval" metric="nDCG@10" score={67.0} rank={{ n: 1, of: 7 }} rows={retrieval} max={80} />
      <EvalCard href="#latency" name="Reranking latency" metric="Median ms" better="lower" score={318} rank={{ n: 6, of: 6, word: 'the most accurate' }} rows={latency} max={400} />
    </div>
  )
}
