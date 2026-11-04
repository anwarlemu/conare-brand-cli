<script setup lang="ts">
import { ref } from 'vue'
import PixelButton from '@/components/ui/PixelButton.vue'
import WorkPanel from '@/components/product/WorkPanel.vue'
import WorkWindow from '@/components/product/WorkWindow.vue'
import { useSeen } from '@/composables/useCellBurst'
// A card with its one action, and the dark panel with a window beside it. The window plays once, when it is on screen:
// the passages land one after another and the foot's square turns red.
const rows = [
  { id: 'acme-msa-2026', score: '0.94' },
  { id: 'legal-thread-1182', score: '0.81' },
  { id: 'acme-oct-review', score: '0.76' },
]
const box = ref<HTMLElement | null>(null)
const seen = useSeen(box, 0.4)
</script>

<template>
  <WorkPanel title="Run a search" line="Ask your data a question. Conare finds the passages that answer it." label="an example" tall>
    <PixelButton large>Run a search</PixelButton>
    <template #window>
      <div ref="box" class="flex w-full justify-center">
        <WorkWindow title="Acme renewal EU data" tag="312 ms" :foot="seen ? '3 of 2,749,690 documents' : 'Searching'" :done="seen">
          <ol class="ds-work-demo flex flex-col px-4 pb-3" :data-play="seen || undefined">
            <li v-for="(r, i) in rows" :key="r.id" class="flex items-center gap-3 border-t border-neutral-300 py-2 type-meta" :style="{ '--i': i }">
              <span class="size-1.5 shrink-0 bg-surface-accent" aria-hidden="true" />
              <span class="min-w-0 flex-1 truncate type-code-sm">{{ r.id }}</span>
              <span class="text-code-muted tabular-nums">{{ r.score }}</span>
            </li>
          </ol>
        </WorkWindow>
      </div>
    </template>
  </WorkPanel>
</template>

<style>
.ds-work-demo > li { opacity: 0; transform: translateY(6px); transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); transition-delay: calc(var(--i) * 120ms + 200ms); }
.ds-work-demo[data-play] > li { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .ds-work-demo > li { transform: none; } }
</style>
