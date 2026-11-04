<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProductMenu from '@/components/site/ProductMenu.vue'
// The menu, opened as the frame loads; point at a product to change the window. The windows here are the default
// stand-ins; the website puts each product's own window in the `window` slot.
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
const root = ref<HTMLElement | null>(null)
onMounted(() => setTimeout(() => root.value?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.click(), 300))
</script>

<template>
  <div ref="root" class="relative flex min-h-140 items-start justify-center px-6 py-4">
    <ul class="flex text-body leading-none text-fg-soft">
      <ProductMenu :items="items" :more="more" />
    </ul>
  </div>
</template>
