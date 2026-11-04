<script setup lang="ts">
import CodeCopy from '@/components/ui/CodeCopy.vue'
// How to bring a part into an app, the first thing on its page: one line on the paper, with its Copy.
defineProps<{ command: string }>()
</script>

<template>
  <div class="flex w-fit max-w-full items-center gap-4 border border-edge bg-surface-subtle py-2 pr-2 pl-4">
    <code class="min-w-0 overflow-x-auto type-code-sm whitespace-nowrap [scrollbar-width:none]" tabindex="0"><span class="text-fg-muted" aria-hidden="true">$ </span>{{ command }}</code>
    <CodeCopy :text="command" light />
  </div>
</template>
