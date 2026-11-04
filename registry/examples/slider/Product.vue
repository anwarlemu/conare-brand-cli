<script setup lang="ts">
import { ref } from 'vue'
import Slider from '@/components/ui/Slider.vue'
// How many passages a search returns, and a minimum score: the value beside each in tabular figures.
const topK = ref(8)
const score = ref(40)
</script>

<template>
  <div class="flex w-90 max-w-full flex-col gap-4">
    <div class="flex flex-col gap-1">
      <div class="flex items-baseline justify-between type-meta"><span class="text-fg-soft">Passages per search</span><span class="tabular-nums">{{ topK }}</span></div>
      <Slider v-model="topK" label="passages per search" :min="1" :max="20" />
    </div>
    <div class="flex flex-col gap-1">
      <div class="flex items-baseline justify-between type-meta"><span class="text-fg-soft">Minimum score</span><span class="tabular-nums">{{ (score / 100).toFixed(2) }}</span></div>
      <Slider v-model="score" label="minimum score" :value-text="(score / 100).toFixed(2)" :step="5" />
    </div>
    <div class="flex flex-col gap-1">
      <div class="flex items-baseline justify-between type-meta"><span class="text-fg-muted">Rerank depth (on the Scale plan)</span><span class="tabular-nums text-fg-muted">50</span></div>
      <Slider :model-value="50" label="rerank depth" disabled />
    </div>
  </div>
</template>
