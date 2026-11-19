<script setup lang="ts">
import CodeCopy from '@/components/ui/CodeCopy.vue'
// One generated example: the picture at its own shape, what it is, and the command that made it, with its Copy.
defineProps<{ src: string, width: number, height: number, title: string, description?: string, command: string, href?: string, hrefLabel?: string }>()
</script>

<template>
  <figure class="flex min-w-0 flex-col border border-edge bg-surface">
    <div class="flex items-center justify-center border-b border-edge bg-surface-subtle p-3">
      <img :src="src" :width="width" :height="height" :alt="title" loading="lazy" class="h-auto max-h-80 w-auto max-w-full border border-edge">
    </div>
    <figcaption class="flex min-w-0 flex-col gap-2 p-3">
      <p class="flex items-baseline gap-2 type-ui-strong">{{ title }}<span class="type-caption text-fg-muted tabular-nums">{{ width }} x {{ height }}</span><a v-if="href" :href="href" class="ml-auto type-meta text-fg-muted underline decoration-edge-strong underline-offset-4 hover:text-fg">{{ hrefLabel ?? 'SVG' }}</a></p>
      <p v-if="description" class="type-meta text-fg-soft">{{ description }}</p>
      <div class="flex min-w-0 items-center gap-2 border border-edge bg-surface-subtle py-1 pr-1 pl-2">
        <code class="min-w-0 flex-1 overflow-x-auto type-code-sm whitespace-nowrap [scrollbar-width:none]" tabindex="0">{{ command }}</code>
        <CodeCopy :text="command" light />
      </div>
    </figcaption>
  </figure>
</template>
