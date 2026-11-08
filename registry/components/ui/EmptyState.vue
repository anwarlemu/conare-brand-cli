<script setup lang="ts">
// A dashed box for a list with nothing in it yet (console2.css .v2-empty): one line on what is missing and the
// actions that fill it, 8px under it. No illustrations, and never without a way forward.
defineProps<{ title: string, description?: string }>()
</script>

<template>
  <div data-ds="empty-state" class="flex flex-col items-center gap-1 border border-dashed border-edge-strong px-4 py-10 text-center">
    <p class="type-ui">{{ title }}</p>
    <p v-if="description" class="type-meta text-fg-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-2 flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
