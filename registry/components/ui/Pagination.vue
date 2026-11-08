<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

// Pages of a long list, when its order means a place to come back to (an audit log): two secondary icon buttons
// around the page count in tabular figures, 12px muted. The buttons go grey at either end. Prefer ShowMore for a
// list read from the top (credits added, matches): it keeps what was read on screen.
const page = defineModel<number>('page', { required: true })
withDefaults(defineProps<{ pages: number, label?: string }>(), { label: 'pages' })
</script>

<template>
  <nav data-ds="pagination" class="flex items-center gap-3" :aria-label="label">
    <Button icon aria-label="Previous page" :disabled="page <= 1" @click="page = Math.max(1, page - 1)"><ChevronLeft :size="14" :stroke-width="1.5" aria-hidden="true" /></Button>
    <span class="type-meta text-fg-muted tabular-nums" aria-live="polite">Page <span class="text-fg">{{ page }}</span> of {{ pages }}</span>
    <Button icon aria-label="Next page" :disabled="page >= pages" @click="page = Math.min(pages, page + 1)"><ChevronRight :size="14" :stroke-width="1.5" aria-hidden="true" /></Button>
  </nav>
</template>
