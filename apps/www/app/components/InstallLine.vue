<script setup lang="ts">
import CodeCopy from '@/components/ui/CodeCopy.vue'
// How to bring a part into an app, the first thing on its page: one line on the paper, with its Copy. Several lines
// (the tags a page with no build step needs, an import) show as written; a shell command gets the prompt.
defineProps<{ command: string }>()
</script>

<template>
  <div class="flex w-fit max-w-full items-center gap-4 border border-edge bg-surface-subtle py-2 pr-2 pl-4">
    <code class="fade-x min-w-0 overflow-x-auto type-code-sm whitespace-pre [scrollbar-width:none]" tabindex="0"><span v-if="/^(npx|bunx?|npm|pnpm|yarn) /.test(command)" class="text-fg-muted" aria-hidden="true">$ </span>{{ command }}</code>
    <CodeCopy :text="command" light />
  </div>
</template>
