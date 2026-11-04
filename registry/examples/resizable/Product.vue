<script setup lang="ts">
import { ref } from 'vue'
import Resizable from '@/components/ui/Resizable.vue'
// A page and its docs side by side, the hairline between them: drag it, or focus it and use the arrow keys.
const share = ref(62)
</script>

<template>
  <div class="flex flex-col gap-2">
    <Resizable v-model="share" class="h-72 border border-edge" label="resize the docs panel" :min="30" :max="80">
      <template #first>
        <div class="flex flex-col gap-1 p-4">
          <h3 class="type-heading-3">Search</h3>
          <p class="type-meta text-fg-muted">Ask a question of the contracts namespace.</p>
        </div>
      </template>
      <template #second>
        <div class="flex h-12 items-center border-b border-edge px-4 type-ui-strong">Docs</div>
        <p class="p-4 type-ui text-fg-soft">Search returns the passages that answer a question, best first, each with its source.</p>
      </template>
    </Resizable>
    <p class="type-meta text-fg-muted tabular-nums">Page {{ Math.round(share) }}%, docs {{ 100 - Math.round(share) }}%</p>
  </div>
</template>
