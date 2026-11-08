<script setup lang="ts">
import { computed } from 'vue'

// Steps as squares (SetupMeter.vue, after the overview's pixel meters): 6px squares 2px apart, done steps ink, the next
// one red, the rest an empty hairline. A picture: put the words beside it ("2 of 4 done").
const props = defineProps<{ steps: boolean[] }>()
const next = computed(() => props.steps.findIndex(f => !f))
</script>

<template>
  <span data-ds="step-meter" class="inline-flex gap-0.5" aria-hidden="true">
    <i
      v-for="(done, i) in steps"
      :key="i"
      class="size-1.5 border"
      :class="done ? 'border-surface-inverse bg-surface-inverse' : i === next ? 'border-edge-accent bg-edge-accent' : 'border-edge-strong'"
    />
  </span>
</template>
