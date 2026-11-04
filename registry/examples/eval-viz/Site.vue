<script setup lang="ts">
import EvalViz, { type Eval } from '@/components/visuals/EvalViz.vue'
// One benchmark's window as the website's benchmarks band shows it: the leaderboard's rows enter in turn and their bars
// grow, the model's own row in red. Sample figures from the website's embedding benchmark.
const vidore: Eval = {
  id: 'vidore-embedding',
  name: 'ViDoRe v3, embedding',
  description: 'Search over 19,252 business document pages with 2,419 questions in English and French.',
  metric: 'nDCG@10',
  better: 'higher',
  model: 'conare-embed-1',
  score: 67.0,
  rank: { n: 1, of: 9 },
  rows: [
    { rank: 1, name: 'conare-embed-1', value: 67.02, ours: true },
    { rank: 2, name: 'Perplexity pplx-embed-v2-late-9b, page images', value: 66.48 },
    { rank: 3, name: 'Perplexity pplx-embed-v2-late-9b, page text', value: 66.10 },
    { rank: 4, name: 'Mixedbread search, page images', value: 64.24 },
    { rank: 5, name: 'Mixedbread search, page text', value: 62.25 },
    { rank: 6, name: 'voyage-4-large', value: 60.64 },
    { rank: 7, name: 'gemini-embedding-2', value: 58.70 },
    { rank: 8, name: 'voyage-multimodal-3.5, page images', value: 57.54 },
    { rank: 9, name: 'BM25', value: 49.68 },
  ],
  max: 80,
  disclosure: 'ViDoRe v3 was one of the benchmarks used to choose conare-embed-1. Perplexity\'s 9B on page images is level with it within the 95% interval.',
}
</script>

<template>
  <div class="relative grid place-items-center overflow-hidden bg-neutral-200 px-4 py-10 text-neutral-300">
    <EvalViz :item="vidore" active />
  </div>
</template>
