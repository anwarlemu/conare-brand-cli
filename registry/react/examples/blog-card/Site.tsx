import { BlogCard } from '@/react/components/site/BlogCard'
import { EvalViz, type Eval } from '@/react/components/visuals/EvalViz'
// The blog's list: three posts, each with its picture of cells. The benchmark post plays its leaderboard (eval-viz, the
// top three) once the card is on screen; the slot takes any 520 by 380 window.
const posts = [
  { slug: 'retrieval-benchmark', title: 'Acme retrieval benchmark: 67.0, #1 of 9', dek: 'Search over 19,252 business document pages with 2,419 questions.', category: 'Benchmarks', date: 'October 14, 2026' },
  { slug: 'six-languages', title: 'Six languages, one index', dek: 'The same pages, with questions asked in six languages.', category: 'Product', date: 'October 2, 2026' },
  { slug: 'changelog-october', title: 'What changed in October', dek: 'Faster syncs, filters in search and a new usage page.', category: 'Changelog', date: 'September 30, 2026' },
]
const benchmark: Eval = {
  id: 'acme-retrieval',
  name: 'Acme retrieval benchmark',
  description: 'Search over 19,252 business document pages with 2,419 questions.',
  metric: 'nDCG@10',
  better: 'higher',
  model: 'conare-embed-1',
  score: 67.0,
  rank: { n: 1, of: 9 },
  rows: [
    { name: 'conare-embed-1', value: 67.02, ours: true },
    { name: 'Provider B, page images', value: 66.48 },
    { name: 'Provider C, page text', value: 64.24 },
    { name: 'Provider D', value: 60.64 },
    { name: 'BM25', value: 49.68 },
  ],
  max: 80,
}
export default function Site() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {posts.map((p, n) => (
        <BlogCard
          key={p.slug}
          href={`#${p.slug}`}
          title={p.title}
          dek={p.dek}
          category={p.category}
          author="Acme team"
          date={p.date}
          window={n === 0 ? ({ active }) => <EvalViz item={benchmark} active={active} limit={3} /> : undefined}
        />
      ))}
    </div>
  )
}
