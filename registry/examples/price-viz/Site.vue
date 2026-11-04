<script setup lang="ts">
import PriceViz, { type PriceData } from '@/components/visuals/PriceViz.vue'
// Accuracy against list price: point at a point or a row to scope it. Sample figures from the website's embedding
// benchmark.
const data: PriceData = {
  benchmark: 'ViDoRe v3, embedding',
  metric: 'nDCG@10',
  points: [
    { name: 'conare-embed-1', price: 0.10, score: 67.02, ours: true },
    { name: 'Mixedbread', price: 1.50, score: 62.25 },
    { name: 'voyage-4-large', price: 0.12, score: 60.64 },
    { name: 'gemini-embedding-2', price: 0.20, score: 58.70 },
    { name: 'Cohere embed-v4.0', price: 0.12, score: 56.63 },
  ],
  note: 'List prices per 1M tokens. Mixedbread publishes no embedding price; its $1.50 is indexing per 1M content tokens.',
}
</script>

<template>
  <div class="relative grid min-h-80 place-items-center overflow-hidden bg-neutral-200 px-4 py-10 text-neutral-300">
    <PriceViz :data="data" active />
  </div>
</template>
