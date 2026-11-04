<script setup lang="ts">
import StepViz from '@/components/visuals/StepViz.vue'
// The four steps side by side: write, sync a source, search, and an agent over MCP.
const runs = [212, 238, 251, 196]
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <div v-for="s in 4" :key="s" class="relative grid min-h-80 place-items-center overflow-hidden bg-neutral-200 px-4 py-8 text-neutral-300">
      <StepViz :step="s - 1" :runs="runs" active />
    </div>
  </div>
</template>
