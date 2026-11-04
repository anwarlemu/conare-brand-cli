<script setup lang="ts">
import ProductViz, { type ProductVizId } from '@/components/visuals/ProductViz.vue'
// Three products as the website's product cards draw them: search, embed and rerank.
const ids: ProductVizId[] = ['search', 'embed', 'rerank']
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <div v-for="id in ids" :key="id" class="relative grid min-h-64 place-items-center overflow-hidden bg-neutral-200 px-4 py-8 text-neutral-300">
      <ProductViz :id="id" active />
    </div>
  </div>
</template>
