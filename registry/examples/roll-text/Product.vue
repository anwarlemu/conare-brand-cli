<script setup lang="ts">
import { ref } from 'vue'
import RollText from '@/components/visuals/RollText.vue'
// The docs panel's links: hover one, or reach it with Tab, and its label rolls at the console's pace.
const links = ['Quickstart', 'Namespaces', 'Search', 'Connect an agent']
const current = ref('Quickstart')
</script>

<template>
  <nav class="flex w-58 flex-col" aria-label="docs">
    <button
      v-for="l in links"
      :key="l"
      type="button"
      class="ds-roll-host relative flex h-control-sm gap-2 cursor-pointer items-center px-2 text-ui text-fg-soft transition-[background-color,color] duration-120 ease-standard hover:bg-surface-subtle hover:text-fg focus-visible:-outline-offset-2 aria-[current=page]:bg-surface aria-[current=page]:font-medium aria-[current=page]:text-fg aria-[current=page]:outline aria-[current=page]:-outline-offset-1 aria-[current=page]:outline-edge max-md:h-11 max-md:text-body"
      :aria-current="current === l ? 'page' : undefined"
      @click="current = l"
    >
      <RollText :text="l" class="min-w-0 flex-1 text-left" />
    </button>
  </nav>
</template>
