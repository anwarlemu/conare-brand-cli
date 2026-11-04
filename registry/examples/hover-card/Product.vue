<script setup lang="ts">
import { Layers } from 'lucide-vue-next'
import HoverCard from '@/components/ui/HoverCard.vue'
// A namespace named in a sentence; rest the pointer on it (or tab to it) and its card shows what it holds and where it
// comes from. The link still works on its own.
</script>

<template>
  <div class="flex min-h-56 items-start justify-center">
    <p class="max-w-90 type-ui text-fg-soft">
      Answers about notice periods come from
      <HoverCard>
        <a href="#" class="font-code text-meta text-fg underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-120 ease-standard hover:decoration-fg" @click.prevent>contracts</a>
        <template #card>
          <div class="flex items-center gap-2">
            <span class="inline-flex size-5 items-center justify-center border border-edge bg-surface-subtle text-fg-muted" aria-hidden="true"><Layers :size="12" :stroke-width="1.5" /></span>
            <span class="type-code-sm text-fg">contracts</span>
          </div>
          <p class="mt-2 type-meta text-fg-soft">Signed agreements and their amendments, synced from Acme drive every hour.</p>
          <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-edge pt-3 type-meta">
            <dt class="text-fg-muted">Documents</dt><dd class="text-right tabular-nums">412,830</dd>
            <dt class="text-fg-muted">Last sync</dt><dd class="text-right tabular-nums">4 min ago</dd>
          </dl>
        </template>
      </HoverCard>,
      the namespace your agents search first.
    </p>
  </div>
</template>
