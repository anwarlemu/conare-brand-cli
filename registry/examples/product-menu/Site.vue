<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProductMenu from '@/components/site/ProductMenu.vue'
import CellBurst from '@/components/visuals/CellBurst.vue'
import EvalViz, { type Eval } from '@/components/visuals/EvalViz.vue'
import PriceViz, { type PriceData } from '@/components/visuals/PriceViz.vue'
import ProductViz, { type ProductVizId } from '@/components/visuals/ProductViz.vue'
// The menu, opened as the frame loads; point at a product to change the window. Each product shows its own window
// (product-viz) over a sheet of cells; Benchmarks and Price vs accuracy show the leaderboard (eval-viz) and the price
// chart (price-viz), drawn at their own width and scaled to fit, laid over the panel so they never set its height.
// Each plays again every time it comes into view (`plays`).
const items = [
  { label: 'Search', desc: 'Store documents and query them.', href: '#search' },
  { label: 'Sync', desc: 'Keep your apps in a namespace.', href: '#sync' },
  { label: 'Parse', desc: 'Read any file in full, every row and cell.', href: '#parse' },
  { label: 'Embed', desc: 'Embeddings for any vector database.', href: '#embed' },
  { label: 'Rerank', desc: 'Put the best passages first.', href: '#rerank' },
]
const more = [
  { label: 'Benchmarks', desc: 'Accuracy you can check, losses included.', href: '#benchmarks' },
  { label: 'Price vs accuracy', desc: 'Most accurate, and the cheapest.', href: '#price' },
]
const benchmark: Eval = {
  id: 'acme-retrieval',
  name: 'Acme retrieval benchmark',
  description: 'Search over 19,252 business document pages with 2,419 questions.',
  metric: 'nDCG@10',
  better: 'higher',
  model: 'conare-embed-1',
  score: 67.0,
  rank: { n: 1, of: 6 },
  rows: [
    { name: 'conare-embed-1', value: 67.02, ours: true },
    { name: 'Provider B', value: 66.48 },
    { name: 'Provider C', value: 64.24 },
    { name: 'Provider D', value: 60.64 },
    { name: 'Provider E', value: 58.7 },
    { name: 'BM25', value: 49.68 },
  ],
  max: 80,
}
const price: PriceData = {
  benchmark: 'Acme retrieval benchmark',
  metric: 'nDCG@10',
  points: [
    { name: 'conare-embed-1', price: 0.1, score: 67.02, ours: true },
    { name: 'Provider B', price: 1.5, score: 62.25 },
    { name: 'Provider C', price: 0.12, score: 60.64 },
    { name: 'Provider D', price: 0.2, score: 58.7 },
  ],
}
const root = ref<HTMLElement | null>(null)
onMounted(() => setTimeout(() => root.value?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.click(), 300))
</script>

<template>
  <div ref="root" class="relative flex min-h-140 items-start justify-center px-6 py-4">
    <ul class="flex text-body leading-none text-fg-soft">
      <ProductMenu :items="items" :more="more">
        <template #window="{ item, index, active, plays }">
          <template v-if="index < items.length">
            <CellBurst :seed="71 + index * 19" jumble />
            <ProductViz :id="(item.href.slice(1) as ProductVizId)" :key="active ? `${index}-${plays}` : index" :active="active" class="relative" />
          </template>
          <div v-else class="absolute inset-0 flex items-center justify-center overflow-hidden px-3 py-4">
            <CellBurst :seed="131 + (index - items.length) * 23" jumble />
            <div class="relative flex w-120 shrink-0 origin-center scale-[0.62] justify-center">
              <EvalViz v-if="index === items.length" :key="active ? `b-${plays}` : 'b'" :item="benchmark" :limit="5" :active="active" />
              <PriceViz v-else :key="active ? `p-${plays}` : 'p'" :data="price" :active="active" />
            </div>
          </div>
        </template>
      </ProductMenu>
    </ul>
  </div>
</template>
