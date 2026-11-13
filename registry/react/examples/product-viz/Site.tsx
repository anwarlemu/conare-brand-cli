import { ProductViz, type ProductVizId } from '@/react/components/visuals/ProductViz'
// Three products as the website's product cards draw them: search, embed and rerank.
const ids: ProductVizId[] = ['search', 'embed', 'rerank']

export default function Site() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ids.map(id => (
        <div key={id} className="relative grid min-h-64 place-items-center overflow-hidden bg-ds-neutral-200 px-4 py-8 text-ds-neutral-300">
          <ProductViz id={id} active />
        </div>
      ))}
    </div>
  )
}
