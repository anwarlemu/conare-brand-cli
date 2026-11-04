<script setup lang="ts">
import PixelButton from '@/components/ui/PixelButton.vue'
import WorkPanel from '@/components/product/WorkPanel.vue'
import StepViz from '@/components/visuals/StepViz.vue'
// A card with its one action, and the dark panel with a window beside it: How it works' search step (step-viz), which
// plays once as it renders.
const RUNS = [0, 0, 0, 0]
</script>

<template>
  <WorkPanel title="Run a search" line="Ask your data a question. Conare finds the passages that answer it." label="an example" tall>
    <PixelButton large>Run a search</PixelButton>
    <template #window>
      <StepViz :step="2" :runs="RUNS" active />
    </template>
  </WorkPanel>
</template>
